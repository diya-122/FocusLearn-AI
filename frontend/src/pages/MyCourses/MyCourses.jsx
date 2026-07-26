import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaBookOpen, FaPlay, FaTrash } from 'react-icons/fa';
import courseService from '../../services/courseService';
import { getTopicImage } from '../../utils/getTopicImage';
import styles from './MyCourses.module.css';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { search } = useOutletContext() || { search: '' };

  const filteredCourses = courses.filter(course => {
    if (!search) return true;
    const q = search.toLowerCase();
    return course.title.toLowerCase().includes(q) || 
           (course.category && course.category.toLowerCase().includes(q));
  });

  useEffect(() => {
    courseService.getEnrolled().then(res => {
      setCourses(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><FaBookOpen /> My Lessons</h2>
        <p>All your imported videos and enrolled courses</p>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading your lessons...</div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't imported any videos or enrolled in any courses yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard to Import</button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.empty}>
          <p>No lessons found matching "{search}"</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCourses.map(course => (
            <div key={course.id} className={styles.card} style={{ position: 'relative' }} onClick={() => {
              if (course.first_lesson_id) {
                navigate(`/course/${course.first_lesson_id}`);
              } else if (course.lessons && course.lessons.length > 0) {
                navigate(`/course/${course.lessons[0].id || course.lessons[0]}`);
              } else {
                navigate(`/course/${course.id}`);
              }
            }}>
              <button 
                className={styles.deleteBtn}
                title="Delete Lesson"
                onClick={async (e) => {
                  e.stopPropagation();
                  if(window.confirm('Are you sure you want to delete this lesson?')) {
                    try {
                      await courseService.delete(course.id);
                      setCourses(courses.filter(c => c.id !== course.id));
                    } catch (err) {
                      alert('Failed to delete lesson.');
                    }
                  }
                }}
              >
                <FaTrash />
              </button>
              <div className={styles.thumbWrap}>
                <img
                  src={course.thumbnail_url || course.thumbnail || getTopicImage(course.title)}
                  alt={course.title}
                  className={styles.thumbImg}
                />
                <div className={styles.playOverlay}>
                  <FaPlay />
                </div>
              </div>
              <div className={styles.cardBody}>
                <h4>{course.title}</h4>
                <p>{course.category || 'General'}</p>
                {course.lessons && course.lessons.length > 0 && (
                  <p className={styles.lessonCount}>{course.lessons.length} video{course.lessons.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
