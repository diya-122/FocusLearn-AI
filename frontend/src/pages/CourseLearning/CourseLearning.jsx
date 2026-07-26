import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBrain, FaRobot, FaSave, FaCheck } from 'react-icons/fa';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import FocusMeter from '../../components/FocusMeter/FocusMeter';
import EngagementPopup from '../../components/EngagementPopup/EngagementPopup';
import ForcedQuizModal from '../../components/ForcedQuizModal/ForcedQuizModal';
import courseService from '../../services/courseService';
import quizService from '../../services/quizService';
import styles from './CourseLearning.module.css';
import '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

// Eye Aspect Ratio — detects if eyes are open or closed
function calculateEAR(landmarks, indices) {
  const [p1, p2, p3, p4, p5, p6] = indices.map(i => landmarks[i]);
  const v1 = Math.sqrt((p2.x - p6.x) ** 2 + (p2.y - p6.y) ** 2);
  const v2 = Math.sqrt((p3.x - p5.x) ** 2 + (p3.y - p5.y) ** 2);
  const h  = Math.sqrt((p1.x - p4.x) ** 2 + (p1.y - p4.y) ** 2);
  return (v1 + v2) / (2 * h);
}

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [summary, setSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(true);
  const [focusScore, setFocusScore] = useState(87);
  const [activeModel, setActiveModel] = useState('loading');
  const [cameraActive, setCameraActive] = useState(true);
  const [isTrackingStarted, setIsTrackingStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [forcedQuizOpen, setForcedQuizOpen] = useState(false);
  const [forcedQuizData, setForcedQuizData] = useState(null);
  const [isGeneratingForcedQuiz, setIsGeneratingForcedQuiz] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: '👋 Hi! I\'m your AI learning assistant. Ask me anything about this lesson!' },
  ]);

  useEffect(() => {
    courseService.getLesson(id).then(res => setLesson(res.data)).catch(console.error);
    // Load saved notes
    courseService.getNotes(id).then(res => {
      if (res.data.content) setNotes(res.data.content);
    }).catch(() => {});
    // Load chat history
    courseService.getChatHistory(id).then(res => {
      if (res.data && res.data.length > 0) {
        setChatMessages([
          { role: 'bot', text: '👋 Hi! I\'m your AI learning assistant. Ask me anything about this lesson!' },
          ...res.data.map(m => ({ role: m.role, text: m.text })),
        ]);
      }
    }).catch(() => {});
  }, [id]);

  // Auto-save notes with 3s debounce
  const saveTimerRef = useRef(null);
  const handleNotesChange = useCallback((value) => {
    setNotes(value);
    setNotesSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      courseService.saveNotes(id, value).then(() => setNotesSaved(true)).catch(console.error);
    }, 3000);
  }, [id]);

  const handleSaveNotes = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    courseService.saveNotes(id, notes).then(() => setNotesSaved(true)).catch(console.error);
  };

  const fullscreenContainerRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const blazefaceModelRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Shared focus update helpers
  const updateFocused = useCallback(() => {
    setFocusScore(prev => Math.min(100, prev + 15));
  }, []);

  const updateDistracted = useCallback(() => {
    setFocusScore(prev => {
      const next = Math.max(30, prev - 4);
      if (next < 45) setShowPopup(true);
      return next;
    });
  }, []);

  // Real-time AI webcam focus tracking — Dual-Model Architecture
  // Primary: MediaPipe Face Mesh (468 landmarks) for head pose + eye tracking
  // Fallback: TensorFlow.js BlazeFace (6 points) for basic face detection
  useEffect(() => {
    if (!isTrackingStarted) return;

    let isMounted = true;

    const shouldSkipTracking = () => {
      return document.getElementById('engagement-popup') ||
             document.querySelector('.ForcedQuizModal_modal__') ||
             forcedQuizOpen;
    };

    // ========== PRIMARY: MediaPipe Face Mesh ==========
    const initMediaPipe = async () => {
      if (!window.FaceMesh || !window.Camera) {
        throw new Error("MediaPipe globals not found on window");
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (!isMounted || shouldSkipTracking()) return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const lm = results.multiFaceLandmarks[0];
          setCameraActive(true);

          // --- Eye Aspect Ratio (detects closed/sleepy eyes) ---
          const leftEAR  = calculateEAR(lm, [362, 385, 387, 263, 373, 380]);
          const rightEAR = calculateEAR(lm, [33, 160, 158, 133, 153, 144]);
          const avgEAR = (leftEAR + rightEAR) / 2;
          const eyesClosed = avgEAR < 0.2;

          // --- Head Pose: Yaw (left-right turn) ---
          const noseTip    = lm[1];
          const leftCheek   = lm[234];
          const rightCheek  = lm[454];
          const faceWidth   = Math.abs(rightCheek.x - leftCheek.x);
          const noseOffset  = noseTip.x - (leftCheek.x + rightCheek.x) / 2;
          const isLookingAway = Math.abs(noseOffset / (faceWidth || 1)) > 0.15;

          // --- Head Pose: Pitch (looking down at phone) ---
          const forehead = lm[10];
          const chin     = lm[152];
          const faceHeight = Math.abs(chin.y - forehead.y);
          const nosePitch  = (noseTip.y - forehead.y) / (faceHeight || 1);
          const isLookingDown = nosePitch > 0.65;

          const isFocused = !isLookingAway && !isLookingDown && !eyesClosed;
          isFocused ? updateFocused() : updateDistracted();
        } else {
          setCameraActive(true);
          updateDistracted();
        }
      });

      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = camera;
        await camera.start();
      }

      setActiveModel('mediapipe');
      console.log('%c✅ MediaPipe Face Mesh loaded (468-landmark mode)', 'color: #10B981; font-weight: bold;');
    };

    // ========== FALLBACK: TensorFlow.js BlazeFace ==========
    const initBlazeFace = async () => {
      console.warn('⚠️ MediaPipe unavailable, falling back to TensorFlow.js BlazeFace');

      blazefaceModelRef.current = await blazeface.load();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      trackingIntervalRef.current = setInterval(async () => {
        if (!isMounted || !videoRef.current || !blazefaceModelRef.current || videoRef.current.readyState !== 4) return;
        if (shouldSkipTracking()) return;

        // Detect if camera is covered
        canvas.width = 32;
        canvas.height = 32;
        ctx.drawImage(videoRef.current, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += data[i] + data[i+1] + data[i+2];
        }
        if ((sum / (32 * 32 * 3)) < 15) {
          setCameraActive(false);
          return;
        }
        setCameraActive(true);

        const predictions = await blazefaceModelRef.current.estimateFaces(videoRef.current, false);
        let isFocused = false;

        if (predictions.length > 0) {
          const face = predictions.reduce((prev, curr) => (prev.probability[0] > curr.probability[0]) ? prev : curr);
          if (face.probability && face.probability[0] > 0.95) {
            const faceWidth = face.bottomRight[0] - face.topLeft[0];
            const videoWidth = videoRef.current.videoWidth;
            let isLookingAway = false;

            if (face.landmarks && face.landmarks.length >= 3) {
              const rightEye = face.landmarks[0];
              const leftEye = face.landmarks[1];
              const nose = face.landmarks[2];
              const eyeDist = Math.abs(leftEye[0] - rightEye[0]);
              const noseToRight = Math.abs(nose[0] - rightEye[0]);
              const noseToLeft = Math.abs(leftEye[0] - nose[0]);
              if (eyeDist > 0) {
                if ((noseToRight / eyeDist) > 0.8 || (noseToLeft / eyeDist) > 0.8) {
                  isLookingAway = true;
                }
              }
            }

            if (faceWidth > videoWidth * 0.15 && !isLookingAway) {
              isFocused = true;
            }
          }
        }

        isFocused ? updateFocused() : updateDistracted();
      }, 1000);

      setActiveModel('blazeface');
      console.log('%c🔄 BlazeFace loaded (6-point fallback mode)', 'color: #F59E0B; font-weight: bold;');
    };

    // ========== INITIALIZATION: Try MediaPipe first, fallback to BlazeFace ==========
    const init = async () => {
      try {
        await initMediaPipe();
      } catch (err) {
        console.error('MediaPipe init failed:', err);
        try {
          await initBlazeFace();
        } catch (fallbackErr) {
          console.error('Both AI models failed to load:', fallbackErr);
          setActiveModel('none');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      // Cleanup MediaPipe
      if (cameraRef.current) cameraRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
      // Cleanup BlazeFace
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isTrackingStarted]);

  useEffect(() => {
    const vids = document.querySelectorAll('video');
    const iframe = document.querySelector('iframe');
    
    if (showPopup || isGeneratingForcedQuiz) {
      vids.forEach(v => {
        if (v !== videoRef.current) v.pause();
      });
      if (iframe) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
      }
    } else if (!forcedQuizOpen) {
      vids.forEach(v => {
        if (v !== videoRef.current) v.play();
      });
      if (iframe) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
      }
    }
  }, [showPopup, forcedQuizOpen, isGeneratingForcedQuiz]);

  const seekTo = (seconds) => {
    const vids = document.querySelectorAll('video');
    vids.forEach(v => {
      if (v !== videoRef.current) {
        v.currentTime = seconds;
        v.play();
      }
    });
    
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
    }
  };

  const parseTime = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const renderMessageText = (text) => {
    const regex = /(\[?\d{1,2}:\d{2}(?::\d{2})?\]?)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const cleanPart = part.replace(/[\[\]]/g, '');
      const isTimestamp = /^\d{1,2}:\d{2}(?::\d{2})?$/.test(cleanPart);
      if (isTimestamp) {
        const seconds = parseTime(cleanPart);
        return (
          <span 
            key={i} 
            className={styles.timestampLink} 
            onClick={() => seekTo(seconds)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleSendChat = async (textOverride = '') => {
    const input = (textOverride || chatInput).trim();
    if (!input) return;
    setChatMessages(prev => [...prev, { role: 'user', text: input }]);
    if (!textOverride) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'bot', text: '⏳ Thinking...' }]);
    try {
      const res = await courseService.chatWithLesson(id, input);
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', text: res.data.reply };
        return updated;
      });
    } catch (err) {
      console.error(err);
      // Fallback response with a clickable timestamp for demonstration purposes
      setChatMessages(prev => {
        const updated = [...prev];
        let mockReply = 'Sorry, I had trouble reaching the server. ';
        if (input.toLowerCase().includes('timestamp') || input.toLowerCase().includes('key') || input.toLowerCase().includes('explain')) {
          mockReply += 'However, as an example, you can see a key point in this lecture at [00:15] or [00:45] where focus techniques are outlined.';
        } else {
          mockReply += 'Try asking "Show key concepts with timestamps" to test interactive seeking!';
        }
        updated[updated.length - 1] = { role: 'bot', text: mockReply };
        return updated;
      });
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await courseService.generateSummary(id);
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
    setGeneratingSummary(false);
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const res = await quizService.generate(id);
      navigate(`/quizzes/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate quiz. Is the Ollama server running?');
    }
    setGeneratingQuiz(false);
  };

  const handlePopupTimeout = async () => {
    setShowPopup(false);
    setIsGeneratingForcedQuiz(true);
    
    // Attempt to pause main video
    const vids = document.querySelectorAll('video');
    vids.forEach(v => v.pause());
    
    // Attempt to pause YouTube iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
    }

    try {
      let percentage = 0;
      const mainVid = Array.from(vids).find(v => v !== videoRef.current);
      if (mainVid && mainVid.duration) {
        percentage = (mainVid.currentTime / mainVid.duration) * 100;
      }
      
      const res = await quizService.generate(id, percentage);
      setForcedQuizData(res.data);
      setForcedQuizOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to generate attention check quiz. Assuming you passed.');
      vids.forEach(v => v.play());
      if (iframe) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
      }
    }
    setIsGeneratingForcedQuiz(false);
  };

  const handleForcedQuizPass = () => {
    setForcedQuizOpen(false);
    const vids = document.querySelectorAll('video');
    vids.forEach(v => v.play());
    
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
    }
  };

  const handleForcedQuizFail = () => {
    setForcedQuizOpen(false);
    const vids = document.querySelectorAll('video');
    vids.forEach(v => {
      if (v !== videoRef.current) {
        v.currentTime = 0;
      }
      v.play();
    });
    
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
    }
  };

  const tabs = ['notes', 'summary', 'quiz'];

  if (!lesson) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lesson...</div>;

  return (
    <div className={styles.learning}>
      <div className={styles.courseHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>{lesson.title}</h1>
      </div>

      <div className={styles.learningGrid}>
        <div className={styles.leftCol}>
          <div ref={fullscreenContainerRef} style={{ position: 'relative' }}>
            {isGeneratingForcedQuiz && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h2 style={{ marginTop: '20px' }}>Generating Attention Check Quiz...</h2>
                <p style={{ color: '#aaa', marginTop: '10px' }}>Please wait while our AI builds a custom quiz for you.</p>
              </div>
            )}
            
            <ForcedQuizModal 
              isOpen={forcedQuizOpen} 
              quiz={forcedQuizData} 
              onClose={() => setForcedQuizOpen(false)}
              onPass={handleForcedQuizPass}
              onFail={handleForcedQuizFail}
            />

            <VideoPlayer videoUrl={lesson.video_url} videoFile={lesson.video_file} containerRef={fullscreenContainerRef} />

            <EngagementPopup
              isOpen={showPopup}
              onContinue={() => { 
                setShowPopup(false);
                setFocusScore(100);
              }}
              onReview={() => { 
                setShowPopup(false); 
                setFocusScore(100);
                if(document.fullscreenElement) document.exitFullscreen();
                setActiveTab('summary'); 
              }}
              onTimeout={handlePopupTimeout}
            />
          </div>

          <div>
            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'notes' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <h3 style={{ fontSize: 'var(--fs-md)' }}>Lesson Notes</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--fs-xs)', color: notesSaved ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                        {notesSaved ? <><FaCheck style={{ marginRight: '4px' }} /> Saved</> : 'Unsaved changes...'}
                      </span>
                      <button className="btn btn-primary" onClick={handleSaveNotes}
                        style={{ padding: '6px 14px', fontSize: 'var(--fs-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaSave /> Save
                      </button>
                    </div>
                  </div>
                  <textarea className={styles.notesArea} placeholder="Take your notes here... (auto-saves after 3 seconds)"
                    value={notes}
                    onChange={e => handleNotesChange(e.target.value)} />
                </div>
              )}

              {activeTab === 'summary' && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--fs-md)' }}>AI-Generated Summary</h3>
                  {!summary ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                        No summary generated yet.
                      </p>
                      <button className="btn btn-primary" onClick={handleGenerateSummary} disabled={generatingSummary}>
                        {generatingSummary ? 'Generating...' : 'Generate Summary'}
                      </button>
                    </div>
                  ) : (
                    summary.sections?.map((section, i) => (
                      <div key={i} className={styles.summarySection}>
                        <h4>
                          {section.title}
                          {section.isKey && <span className={styles.keyBadge}>Key Concept</span>}
                        </h4>
                        <p>{section.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <FaBrain style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }} />
                  <h3 style={{ marginBottom: 'var(--space-2)' }}>AI Quiz Available</h3>
                  <p style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-4)' }}>
                    Test your understanding with an AI-generated quiz based on this lesson.
                  </p>
                  <button className="btn btn-primary" onClick={handleGenerateQuiz} disabled={generatingQuiz}>
                    {generatingQuiz ? 'Generating...' : 'Take AI Quiz'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.aiPanel}>
          <FocusMeter score={focusScore} />

          <div className={styles.webcamContainer}>
            <div className={styles.webcamHeader}>
              <FaRobot /> Live Attention Tracking
            </div>
            
            {!isTrackingStarted ? (
              <div className={styles.cameraPrompt}>
                <p>Enable your camera for AI attention tracking and focus monitoring.</p>
                <button 
                  className={styles.enableCameraBtn} 
                  onClick={() => setIsTrackingStarted(true)}
                >
                  Enable Camera
                </button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className={styles.webcamVideo} 
                />
                {!cameraActive && (
                  <div className={styles.cameraWarning}>
                    Camera inactive or covered
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.aiCard}>
            <h3><FaRobot /> AI Assistant</h3>
            <div className={styles.aiChatMessages}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatBubble} ${msg.role === 'bot' ? styles.chatBot : styles.chatUser}`}>
                  {renderMessageText(msg.text)}
                </div>
              ))}
            </div>
            <div className={styles.chatSuggestions}>
              <button 
                className={styles.suggestionBtn} 
                onClick={() => handleSendChat("Summarize key concepts with timestamps")}
              >
                🕒 Timestamps
              </button>
              <button 
                className={styles.suggestionBtn} 
                onClick={() => handleSendChat("Explain the main concept")}
              >
                💡 Explain Topic
              </button>
              <button 
                className={styles.suggestionBtn} 
                onClick={() => handleSendChat("Generate a practice quiz question")}
              >
                ❓ Quiz Me
              </button>
            </div>
            <div className={styles.chatInput}>
              <input placeholder="Ask AI a question..." value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
              <button className={styles.chatSendBtn} onClick={() => handleSendChat()}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
