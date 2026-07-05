import { useState } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import { instructorData } from '../../utils/mockData';
import styles from './Instructor.module.css';

export default function Instructor() {
  const [activeTab, setActiveTab] = useState('courses');
  const tabs = ['courses', 'students', 'create'];

  return (
    <div className={styles.instructorPage}>
      <div className={styles.pageHeader}>
        <h2>Instructor Dashboard</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('create')}>
          <FaPlus /> Create Course
        </button>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className={styles.coursesList}>
          {instructorData.courses.map(course => (
            <div key={course.id} className={styles.courseRow}>
              <div className={styles.courseInfo}>
                <h3>{course.title}</h3>
                <p>
                  <span className={`${styles.statusBadge} ${course.status === 'Published' ? styles.published : styles.draft}`}>
                    {course.status}
                  </span>
                </p>
              </div>
              <div className={styles.courseStats}>
                <div className={styles.courseStat}>
                  <h4>{course.students.toLocaleString()}</h4>
                  <p>Students</p>
                </div>
                <div className={styles.courseStat}>
                  <h4>{course.avgFocus}%</h4>
                  <p>Avg Focus</p>
                </div>
                <div className={styles.courseStat}>
                  <h4>{course.avgQuiz}%</h4>
                  <p>Avg Quiz</p>
                </div>
                <button className="btn btn-ghost btn-sm"><FaDownload /> Report</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className={styles.studentTable}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Focus Score</th>
                <th>Quiz Average</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {instructorData.studentStats.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.course}</td>
                  <td>{s.focusScore}%</td>
                  <td>{s.quizAvg}%</td>
                  <td>
                    <span className={`${styles.engagementBadge} ${
                      s.engagement === 'High' ? styles.engHigh :
                      s.engagement === 'Medium' ? styles.engMedium : styles.engLow
                    }`}>
                      {s.engagement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'create' && (
        <div className={styles.createForm}>
          <h3>Create New Course</h3>
          <div className={styles.formGroup}>
            <label>Course Title</label>
            <input type="text" className={styles.formInput} placeholder="Enter course title" />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea className={`${styles.formInput} ${styles.formTextarea}`} placeholder="Course description..." />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select className={styles.formInput}>
              <option>AI & ML</option>
              <option>Web Dev</option>
              <option>CS Fundamentals</option>
              <option>Design</option>
              <option>Cloud</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Difficulty</label>
            <select className={styles.formInput}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Upload Video</label>
            <input type="file" className={styles.formInput} accept="video/*" />
          </div>
          <button className="btn btn-primary">Create Course</button>
        </div>
      )}
    </div>
  );
}
