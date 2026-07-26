import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import quizService from '../../services/quizService';
import styles from './Quiz.module.css';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizService.getById(id).then(res => {
      setQuiz(res.data);
      setTimeLeft((res.data.duration || 10) * 60);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (submitted || timeLeft <= 0 || !quiz) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) handleSubmit();
  }, [timeLeft]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}><FaSpinner /> Loading Quiz...</div>;
  if (!quiz) return <div style={{ padding: '4rem', textAlign: 'center' }}>Quiz not found.</div>;

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const handleSelect = (value) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await quizService.submit(id, answers);
      
      const finalScore = (res.data.score / quiz.total_marks) * 100;
      
      setResults({
        score: Math.round(finalScore) || 0,
        correct: Math.round((finalScore / 100) * quiz.questions.length) || 0,
        total: quiz.questions.length,
        details: [],
        weakAreas: finalScore < 100 ? ['Review missed concepts in the lesson'] : [],
      });
      setSubmitted(true);

      if (finalScore >= 80) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#10B981', '#F59E0B']
        });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit quiz.');
    }
  };



  if (submitted && results) {
    const bg = results.score >= 80 ? 'var(--gradient-accent)' : results.score >= 50 ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #EF4444, #DC2626)';
    return (
      <motion.div 
        className={styles.quizPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.quizContainer}>
          <div className={styles.results}>
            <motion.div 
              className={styles.scoreCircle} 
              style={{ background: bg }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            >
              <span className={styles.scoreValue}>{results.score}%</span>
              <span className={styles.scoreLabel}>Score</span>
            </motion.div>
            <h2>{results.score >= 80 ? '🎉 Excellent!' : results.score >= 50 ? '👍 Good job!' : '📚 Keep Practicing!'}</h2>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>
              You answered {results.correct} out of {results.total} questions correctly.
            </p>

            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <h4>{results.correct}</h4>
                <p>Correct</p>
              </div>
              <div className={styles.resultStat}>
                <h4>{results.total - results.correct}</h4>
                <p>Incorrect</p>
              </div>
              <div className={styles.resultStat}>
                <h4>{quiz.duration - Math.floor(timeLeft / 60)} min</h4>
                <p>Time Used</p>
              </div>
            </div>

            {results.weakAreas.length > 0 && (
              <div className={styles.weakAreas}>
                <h3>⚠️ Areas to Review</h3>
                {results.weakAreas.map((area, i) => (
                  <div key={i} className={styles.weakAreaItem}>
                    <span className={styles.weakAreaBullet} />
                    {area}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.recommendations}>
              <h3>💡 Recommended Topics</h3>
              {['Review supervised learning concepts', 'Practice classification algorithms', 'Revisit neural network architectures'].map((rec, i) => (
                <div key={i} className={styles.recItem}>
                  <FaLightbulb style={{ color: 'var(--color-warning)', flexShrink: 0 }} /> {rec}
                </div>
              ))}
            </div>

            <button className={`btn btn-primary ${styles.retryBtn}`} onClick={() => {
              setSubmitted(false);
              setResults(null);
              setAnswers({});
              setCurrentQ(0);
              setTimeLeft(quiz.duration * 60);
            }}>
              Retry Quiz
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.quizPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <h2>{quiz.title}</h2>
          <p>{quiz.questions.length} Questions · {quiz.duration} Minutes</p>
        </div>

        <div className={styles.progressInfo}>
          <span>Question {currentQ + 1} of {quiz.questions.length}</span>
          <span className={`${styles.timer} ${timeLeft < 60 ? styles.warning : ''}`}>
            <FaClock /> {mins}:{secs}
          </span>
        </div>
        <div className={styles.progressTrack}>
          <motion.div 
            className={styles.progressFill} 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQ}
            className={styles.questionCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.questionNumber}>
            {question.question_type === 'mcq' ? 'Multiple Choice' : 'True or False'}
          </div>
          <h3 className={styles.questionText}>{question.question_text}</h3>

            <div className={styles.options}>
              {question.question_type === 'mcq' ? (
                (question.options_json || []).map((opt, i) => (
                  <motion.div key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.option} ${answers[question.id] === i ? styles.selected : ''}`}
                    onClick={() => handleSelect(i)}>
                    <span className={styles.optionLabel}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </motion.div>
                ))
              ) : (
                ['True', 'False'].map((opt, i) => (
                  <motion.div key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.option} ${answers[question.id] === i ? styles.selected : ''}`}
                    onClick={() => handleSelect(i)}>
                    <span className={styles.optionLabel}>{opt[0]}</span>
                    {opt}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className={styles.navigation}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}>
            Previous
          </button>
          {currentQ < quiz.questions.length - 1 ? (
            <button className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={() => setCurrentQ(prev => prev + 1)}>
              Next
            </button>
          ) : (
            <button className={`${styles.navBtn} ${styles.nextBtn} ${styles.submitBtn}`}
              onClick={handleSubmit}>
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
