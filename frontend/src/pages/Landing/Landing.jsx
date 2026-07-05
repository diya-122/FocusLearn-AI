import { useNavigate } from 'react-router-dom';
import { FaBrain, FaRobot, FaChartLine, FaPuzzlePiece, FaUserGraduate, FaComments, FaStar, FaQuoteLeft, FaPlay } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi2';
import styles from './Landing.module.css';

const testimonials = [
  { id: 1, name: "Sarah L.", role: "Computer Science Student", avatar: "SL", rating: 5, quote: "FocusLearn changed how I study. The AI quizzes ensure I never miss a key concept." },
  { id: 2, name: "James M.", role: "Self-Taught Developer", avatar: "JM", rating: 5, quote: "The real-time focus tracking is a game-changer for my ADHD. I'm so much more productive." },
];

const features = [
  {
    icon: <FaBrain />,
    title: 'Attention Monitoring',
    description: 'Real-time AI-powered tracking of your focus levels using advanced computer vision and eye-gaze detection.',
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    icon: <FaRobot />,
    title: 'AI Summaries',
    description: 'Automatically generated comprehensive summaries of video lessons using cutting-edge language models.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: <FaPuzzlePiece />,
    title: 'Smart Quizzes',
    description: 'AI-generated quizzes tailored to your learning pace, focusing on areas that need improvement.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: <FaUserGraduate />,
    title: 'Adaptive Learning',
    description: 'Personalized learning paths that adapt to your attention patterns and ADHD-specific needs.',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    icon: <FaChartLine />,
    title: 'Progress Analytics',
    description: 'Detailed dashboards showing focus trends, quiz performance, study time, and retention rates.',
    color: '#EC4899',
    bg: '#FCE7F3',
  },
  {
    icon: <FaComments />,
    title: 'Personalized Feedback',
    description: 'AI-driven feedback on your learning habits with actionable recommendations for improvement.',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
];

const steps = [
  { icon: <FaPlay />, title: 'Watch Video', desc: 'Stream course videos on the learning platform' },
  { icon: <FaBrain />, title: 'Attention Monitoring', desc: 'AI tracks your focus in real-time' },
  { icon: <FaRobot />, title: 'AI Summary & Quiz', desc: 'Get auto-generated summaries and quizzes' },
  { icon: <FaChartLine />, title: 'Personalized Learning', desc: 'Adaptive feedback and analytics' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <HiOutlineSparkles />
              <span>🧠</span> AI-Powered Learning Platform
            </div>
            <h1 className={styles.heroTitle}>
              Stay Focused.<br />
              <span className={styles.heroTitleGradient}>Learn Smarter.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AI-powered attention monitoring and adaptive learning for enhanced 
              educational outcomes. Designed for students with ADHD and attention-related challenges.
            </p>
            <div className={styles.heroActions}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Get Started Free
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <img
              className={styles.heroIllustration}
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
              alt="Students learning with AI assistance"
            />
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <div className={styles.cardIcon} style={{ background: '#ECFDF5', color: '#10B981' }}>✅</div>
              Focus Score: 92%
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <div className={styles.cardIcon} style={{ background: '#EEF2FF', color: '#4F46E5' }}>🤖</div>
              AI Summary Ready
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard3}`}>
              <div className={styles.cardIcon} style={{ background: '#F5F3FF', color: '#7C3AED' }}>🏆</div>
              Quiz Score: 90%
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className="container">
          <h2 className="section-title">Powerful Features for <span className="text-gradient">Smarter Learning</span></h2>
          <p className="section-subtitle">
            Everything you need to stay focused and learn effectively, powered by artificial intelligence.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon} style={{ background: feature.bg, color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className="container">
          <h2 className="section-title">How <span className="text-gradient">FocusLearn AI</span> Works</h2>
          <p className="section-subtitle">
            A simple four-step process to transform your learning experience.
          </p>
        </div>
        <div className={styles.stepsContainer}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNumber}>
                <span className={styles.stepIcon}>{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to Learn Smarter?</h2>
        <p>Join thousands of students already using FocusLearn AI to boost their focus and academic performance.</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/register')}>
          Start Learning for Free
        </button>
      </section>
    </div>
  );
}
