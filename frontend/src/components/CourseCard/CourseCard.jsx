import { useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaBookOpen, FaUsers } from 'react-icons/fa';
import { useCourse } from '../../context/CourseContext';
import { getDifficultyColor } from '../../utils/helpers';
import styles from './CourseCard.module.css';

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { isEnrolled, enrollInCourse } = useCourse();
  const enrolled = isEnrolled(course.id);

  const handleEnroll = (e) => {
    e.stopPropagation();
    if (enrolled) {
      navigate(`/course/${course.id}`);
    } else {
      enrollInCourse(course.id);
    }
  };

  return (
    <div className={styles.courseCard} onClick={() => navigate(`/course/${course.id}`)}>
      <div className={styles.thumbnail}>
        <img src={course.thumbnail} alt={course.title} loading="lazy" />
        <span
          className={styles.difficultyBadge}
          style={{ background: getDifficultyColor(course.difficulty) }}
        >
          {course.difficulty}
        </span>
        <span className={styles.ratingBadge}>
          <FaStar className={styles.starIcon} />
          {course.rating}
        </span>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.category}>{course.category}</span>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.instructor}>{course.instructor}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <FaClock /> {course.duration}
          </span>
          <span className={styles.metaItem}>
            <FaBookOpen /> {course.lessons} lessons
          </span>
        </div>

        <div className={styles.tags}>
          {course.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.students}>
            <FaUsers /> {course.students.toLocaleString()} students
          </span>
          <button
            className={`${styles.enrollBtn} ${enrolled ? styles.enrolled : ''}`}
            onClick={handleEnroll}
          >
            {enrolled ? 'Continue' : 'Enroll'}
          </button>
        </div>

        {course.progress > 0 && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${course.progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
