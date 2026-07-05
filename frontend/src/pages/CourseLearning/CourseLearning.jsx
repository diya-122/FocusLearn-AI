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
  const [cameraActive, setCameraActive] = useState(true);
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
  const modelRef = useRef(null);

  // Real-time AI webcam focus tracking
  useEffect(() => {
    let trackingInterval;
    let stream;
    
    const initWebcamAndAI = async () => {
      try {
        modelRef.current = await blazeface.load();
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current.play();
             startTracking();
          }
        }
      } catch (err) {
        console.error("Failed to access webcam or load model:", err);
      }
    };
    
    const startTracking = () => {
      if (trackingInterval) clearInterval(trackingInterval);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      trackingInterval = setInterval(async () => {
        if (videoRef.current && modelRef.current && videoRef.current.readyState === 4) {
           
           // Detect if camera is covered (hardware switch or privacy shutter)
           canvas.width = 32;
           canvas.height = 32;
           ctx.drawImage(videoRef.current, 0, 0, 32, 32);
           const data = ctx.getImageData(0, 0, 32, 32).data;
           let sum = 0;
           for (let i = 0; i < data.length; i += 4) {
              sum += data[i] + data[i+1] + data[i+2];
           }
           // If average pixel brightness is very low, it's black
           const isBlack = (sum / (32 * 32 * 3)) < 15; 
           
           if (isBlack || !videoRef.current.srcObject?.active) {
              setCameraActive(false);
              return; // Pause tracking
           } else {
              setCameraActive(true);
           }

           const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
           
           let isFocused = false;

           if (predictions.length > 0) {
              // Find the most likely face in the frame
              const face = predictions.reduce((prev, current) => (prev.probability[0] > current.probability[0]) ? prev : current);
              
              // Only process if the AI is extremely confident it's actually a human face (filters out pillows/backgrounds)
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
                    const ratioRight = noseToRight / eyeDist;
                    const ratioLeft = noseToLeft / eyeDist;
                    
                    // If the nose is too close to one eye, the head is turned sideways
                    if (ratioRight > 0.8 || ratioLeft > 0.8) {
                       isLookingAway = true;
                    }
                 }
              }
              
              // Face must be reasonably close to camera (15% of width) and looking forward
              if (faceWidth > videoWidth * 0.15 && !isLookingAway) {
                 isFocused = true;
              }
             }
           }
            // Skip tracking if a popup or quiz is open
            if (document.getElementById('engagement-popup') || document.querySelector('.ForcedQuizModal_modal__') || forcedQuizOpen) return;
            
           if (isFocused) {
              setFocusScore(prev => Math.min(100, prev + 15));
           } else {
              setFocusScore(prev => {
                const next = Math.max(30, prev - 4);
                if (next < 45) setShowPopup(true);
                return next;
              });
           }
        }
      }, 1000);
    };

    initWebcamAndAI();

    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const input = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: input }]);
    setChatInput('');
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
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', text: 'Sorry, I could not process your question. Please check if Ollama is running.' };
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

            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={styles.hiddenVideo} 
            />

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


          <div className={styles.aiCard}>
            <h3><FaRobot /> AI Assistant</h3>
            <div className={styles.aiChatMessages}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatBubble} ${msg.role === 'bot' ? styles.chatBot : styles.chatUser}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input placeholder="Ask AI a question..." value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
              <button className={styles.chatSendBtn} onClick={handleSendChat}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
