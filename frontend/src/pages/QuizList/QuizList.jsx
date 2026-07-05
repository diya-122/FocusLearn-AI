import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPuzzlePiece, FaPlay, FaSpinner } from 'react-icons/fa';
import quizService from '../../services/quizService';
import styles from './QuizList.module.css';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    quizService.getAll().then(res => {
      // Handle potential pagination formatting just like we did with courses
      const data = res.data.results || res.data || [];
      setQuizzes(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FaPuzzlePiece /> Your Quizzes</h2>
        <p>Review all quizzes generated for your lessons.</p>
      </div>
      
      {loading ? (
        <div className={styles.loading}><FaSpinner className={styles.spinner} /> Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className={styles.empty}>
          <p>No quizzes found. Generate quizzes from your lessons to see them here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Go to My Lessons</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {quizzes.map(quiz => (
            <div key={quiz.id} className={styles.card} onClick={() => navigate(`/quizzes/${quiz.id}`)}>
              <div className={styles.cardBody}>
                <h4>{quiz.title || `Quiz for Lesson ${quiz.lesson}`}</h4>
                <p>{quiz.questions?.length || 0} Questions</p>
                <div className={styles.startBtn}>
                  <FaPlay /> Start Quiz
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
