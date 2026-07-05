import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from 'react-icons/fa';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ onTimeUpdate, videoUrl, videoFile, containerRef }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
      if (onTimeUpdate) onTimeUpdate(current, dur);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef?.current || videoRef.current?.parentElement;
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen();
      }
    }
  };

  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    // Add enablejsapi=1 to allow postMessage control
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0&fs=0&enablejsapi=1` : null;
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const mediaSrc = videoUrl || (videoFile ? `http://127.0.0.1:8000${videoFile}` : 'https://www.w3schools.com/html/mov_bbb.mp4');

  return (
    <div className={styles.playerWrapper}>
      {ytEmbedUrl ? (
        <>
          <iframe
            src={ytEmbedUrl}
            className={styles.video}
            allowFullScreen={false}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none', width: '100%', height: '100%', aspectRatio: '16/9' }}
          />
          <button 
            className={styles.ytFullscreenBtn} 
            onClick={toggleFullscreen}
            title="Full Screen"
          >
            <FaExpand />
          </button>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            className={styles.video}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onClick={togglePlay}
            poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"
          >
            <source src={mediaSrc} type="video/mp4" />
          </video>

          <div className={styles.controls}>
            <div className={styles.progressContainer} onClick={handleProgressClick}>
              <div className={styles.progress} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.controlsRow}>
              <div className={styles.leftControls}>
                <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={togglePlay}>
                  {playing ? <FaPause /> : <FaPlay />}
                </button>
                <button className={styles.controlBtn} onClick={toggleMute}>
                  {muted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                />
                <span className={styles.timeDisplay}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className={styles.rightControls}>
                <button className={styles.controlBtn} onClick={toggleFullscreen}>
                  <FaExpand />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
