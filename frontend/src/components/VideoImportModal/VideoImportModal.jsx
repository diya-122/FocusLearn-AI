import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaLink, FaUpload, FaSpinner } from 'react-icons/fa';
import courseService from '../../services/courseService';
import styles from './VideoImportModal.module.css';

export default function VideoImportModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'upload'
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!videoTitle) {
        setVideoTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!videoTitle) {
        setVideoTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'url' && !videoUrl) {
      setError('Please provide a video URL.');
      return;
    }
    if (activeTab === 'upload' && !file) {
      setError('Please select a video file to upload.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('title', videoTitle || 'Imported Video');
    if (activeTab === 'url') {
      formData.append('video_url', videoUrl);
    } else {
      formData.append('video_file', file);
    }

    try {
      const response = await courseService.importVideo(formData);
      const newLesson = response.data;
      onClose();
      
      // Navigate to the learning player for this specific lesson
      // Depending on routing, you might have something like /courses/:courseId/learn/:lessonId
      // Let's assume the LMS is set up to handle it by navigating to the course page
      navigate(`/course/${newLesson.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import video. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Import Learning Material</h2>
        <p className={styles.subtitle}>
          Bring any video into FocusLearn AI to instantly generate quizzes, summaries, and track your attention.
        </p>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'url' ? styles.active : ''}`}
            onClick={() => { setActiveTab('url'); setError(null); }}
          >
            <FaLink /> Paste URL
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
            onClick={() => { setActiveTab('upload'); setError(null); }}
          >
            <FaUpload /> Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title (Optional)</label>
            <input 
              type="text" 
              placeholder="E.g., Intro to Machine Learning Lecture 1"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className={styles.input}
            />
          </div>

          {activeTab === 'url' ? (
            <div className={styles.formGroup}>
              <label>Video URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/video.mp4 or YouTube link"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className={styles.input}
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label>Video File</label>
              <div 
                className={styles.dropzone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  style={{ display: 'none' }} 
                />
                <FaUpload className={styles.uploadIcon} />
                {file ? (
                  <p className={styles.fileName}>{file.name}</p>
                ) : (
                  <p>Click or drag and drop a video file here (.mp4, .webm)</p>
                )}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><FaSpinner className={styles.spinner} /> Processing...</> : 'Import & Analyze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
