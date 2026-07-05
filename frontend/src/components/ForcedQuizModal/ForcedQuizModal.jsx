import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPlay, FaRedo } from 'react-icons/fa';
import styles from './ForcedQuizModal.module.css';

export default function ForcedQuizModal({ isOpen, quiz, onClose, onPass, onFail }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer || answers[index] === q.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleContinue = () => {
    setAnswers({});
    setSubmitted(false);
    if (score >= 6) {
      onPass();
    } else {
      onFail();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Attention Check Quiz</h2>
          <p>Answer these questions based on what you just watched.</p>
        </div>

        <div className={styles.content}>
          {!submitted ? (
            <div className={styles.questionList}>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className={styles.questionCard}>
                  <h4>{qIndex + 1}. {q.question_text || q.question}</h4>
                  <div className={styles.options}>
                    {(q.options_json || q.options).map((opt, optIndex) => (
                      <button
                        key={optIndex}
                        className={`${styles.optionBtn} ${answers[qIndex] === optIndex ? styles.selected : ''}`}
                        onClick={() => handleSelect(qIndex, optIndex)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.resultView}>
              <div className={score >= 6 ? styles.resultPass : styles.resultFail}>
                {score >= 6 ? <FaCheckCircle className={styles.resultIcon} /> : <FaTimesCircle className={styles.resultIcon} />}
                <h3>You scored {score} out of {questions.length}</h3>
                <p>
                  {score >= 6 
                    ? 'Great job paying attention! You can continue watching from where you left off.' 
                    : 'It looks like you missed some key points. We will restart the video so you can review.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!submitted ? (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Submit Answers
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleContinue}>
              {score >= 6 ? <><FaPlay /> Continue Video</> : <><FaRedo /> Restart Video</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
