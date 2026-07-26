import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { FaBrain, FaRobot, FaChartLine, FaPuzzlePiece, FaUserGraduate, FaComments, FaPlay, FaCalendarAlt, FaRegEdit, FaFilePdf } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { Robot, GroundReflection, Particles } from '../../components/RobotScene';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Landing.module.css';

function RobotLighting({ isDark }) {
  return (
    <>
      <ambientLight intensity={isDark ? 1.2 : 0.7} color={isDark ? '#cce8ff' : '#aaccee'} />
      <directionalLight position={[-2, 4, 5]} intensity={isDark ? 3.5 : 2.0} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
      <directionalLight position={[3, 2, 2]} intensity={isDark ? 1.8 : 0.9} color={isDark ? '#aaddff' : '#88aacc'} />
      <directionalLight position={[0, 3, -4]} intensity={isDark ? 1.2 : 0.6} color="#00aaff" />
      <pointLight position={[0, -1, 1]} color={isDark ? '#88ccff' : '#6699bb'} intensity={1.0} distance={5} />
      <pointLight position={[0.2, 0.3, 1.5]} color="#00c8ff" intensity={0.8} distance={3} />
      <fog attach="fog" args={[isDark ? '#080d1a' : '#1a2235', 12, 30]} />
    </>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    
    // For feature cards hover gradient tracking
    const cards = document.getElementsByClassName(styles.featureCard);
    for(const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  }, []);

  const features = [
    { icon: <FaBrain />, title: t('feature_attention_title'), description: t('feature_attention_desc'), color: '#4F46E5', bg: '#EEF2FF' },
    { icon: <FaRobot />, title: t('feature_summaries_title'), description: t('feature_summaries_desc'), color: '#7C3AED', bg: '#F5F3FF' },
    { icon: <FaPuzzlePiece />, title: t('feature_quizzes_title'), description: t('feature_quizzes_desc'), color: '#10B981', bg: '#ECFDF5' },
    { icon: <FaUserGraduate />, title: t('feature_adaptive_title'), description: t('feature_adaptive_desc'), color: '#F59E0B', bg: '#FEF3C7' },
    { icon: <FaChartLine />, title: t('feature_analytics_title'), description: t('feature_analytics_desc'), color: '#EC4899', bg: '#FCE7F3' },
    { icon: <FaComments />, title: t('feature_feedback_title'), description: t('feature_feedback_desc'), color: '#3B82F6', bg: '#DBEAFE' },
    { icon: <FaCalendarAlt />, title: 'Calendar', description: 'Track exams, assignments, and important dates with our integrated visual calendar system.', color: '#EF4444', bg: '#FEE2E2' },
    { icon: <FaRegEdit />, title: 'Smart Notes', description: 'Take beautiful, organized notes while you study, complete with tagging, pinning, and course linking.', color: '#06B6D4', bg: '#CFFAFE' },
    { icon: <FaFilePdf />, title: 'PDF Export', description: 'Download your digital notes and summaries directly to your device as clean, formatted PDF documents.', color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const steps = [
    { icon: <FaPlay />,       title: t('step_watch'),       desc: t('step_watch_desc') },
    { icon: <FaBrain />,      title: t('step_attention'),   desc: t('step_attention_desc') },
    { icon: <FaRobot />,      title: t('step_ai'),          desc: t('step_ai_desc') },
    { icon: <FaChartLine />,  title: t('step_personalized'),desc: t('step_personalized_desc') },
  ];

  const heroBg = isDark ? '#080d1a' : '#EEF2FF';
  const vignetteColor = isDark ? '8,13,26' : '238,242,255';

  return (
    <div onMouseMove={handleMouseMove}>
      {/* ── Hero Section ── */}
      <section className={styles.hero} style={{ background: heroBg }}>
        
        {/* Glowing Background Orbs */}
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />

        {/* 3D Robot Canvas — right side */}
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.1, 4.5], fov: 40, near: 0.1, far: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: isDark ? 1.6 : 1.2,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          onCreated={({ gl }) => gl.setClearColor(isDark ? 0x080d1a : 0xEEF2FF, 0)}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <RobotLighting isDark={isDark} />
          <Robot mouseRef={mouseRef} isDark={isDark} />
          <GroundReflection isDark={isDark} />
          <Particles isDark={isDark} />
        </Canvas>

        {/* Left-side vignette blend */}
        <div className={styles.heroVignette} style={{
          background: `
            linear-gradient(to right, rgb(${vignetteColor}) 0%, rgb(${vignetteColor}) 28%, rgba(${vignetteColor},0.6) 50%, transparent 68%),
            linear-gradient(to top, rgba(${vignetteColor},0.6) 0%, transparent 15%)`
        }} />

        {/* Hero text content */}
        <div className={styles.heroInner}>
          {/* Floating AI Cards */}
          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <FaBrain className={styles.cardIcon} />
            <span>Face Mesh Analytics</span>
            <div className={styles.cardDot} />
          </div>
          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <HiOutlineSparkles className={styles.cardIcon} />
            <span>Attention Locked</span>
            <div className={styles.cardDot} />
          </div>

          {/* Right-side floating cards */}
          <div className={`${styles.floatingCard} ${styles.cardRight1}`}>
            <FaChartLine className={styles.cardIconGreen} />
            <div className={styles.cardTextBlock}>
              <span className={styles.cardLabel}>Focus Score</span>
              <span className={styles.cardValue}>92%</span>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.cardRight2}`}>
            <FaPuzzlePiece className={styles.cardIconYellow} />
            <div className={styles.cardTextBlock}>
              <span className={styles.cardLabel}>Quiz Score</span>
              <span className={styles.cardValue}>8 / 10</span>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.cardRight3}`}>
            <FaUserGraduate className={styles.cardIconPurple} />
            <div className={styles.cardTextBlock}>
              <span className={styles.cardLabel}>Learning Streak</span>
              <span className={styles.cardValue}>🔥 7 days</span>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.cardRight4}`}>
            <FaRobot className={styles.cardIcon} />
            <span>AI Summary Ready</span>
            <div className={styles.cardDotGreen} />
          </div>

          <div className={styles.heroContent}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={styles.heroBadge}
            >
              <span className={styles.badgeDot} />
              <HiOutlineSparkles />
              {t('hero_badge')}
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className={styles.heroTitle} 
              style={{ color: isDark ? '#e8edf8' : '#111827' }}
            >
              {t('hero_title_stay')} <span className={styles.textTeal}>{t('hero_title_focused')}</span><br />
              {t('hero_title_learn')} <span className={styles.textYellow}>{t('hero_title_smarter')}</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className={styles.heroSubtitle} 
              style={{ color: isDark ? '#8a9bb8' : '#4B5563' }}
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className={styles.heroActions}
            >
              <button onClick={() => navigate('/register')}>
                {t('hero_cta_primary')}
              </button>
              <button onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('hero_cta_secondary')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className="container">
          <h2 className="section-title">{t('features_title')} <span className="text-gradient">{t('features_title_accent')}</span></h2>
          <p className="section-subtitle">{t('features_subtitle')}</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon} style={{ background: feature.bg, color: feature.color }}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className="container">
          <h2 className="section-title">{t('how_title')} <span className="text-gradient">{t('how_title_accent')}</span> {t('how_title_end')}</h2>
          <p className="section-subtitle">{t('how_subtitle')}</p>
        </div>
        <div className={styles.stepsContainer}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNumber}><span className={styles.stepIcon}>{step.icon}</span></div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>{t('cta_title')}</h2>
        <p>{t('cta_subtitle')}</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/register')}>{t('cta_button')}</button>
      </section>
    </div>
  );
}
