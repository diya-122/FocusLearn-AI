import { createContext, useContext, useState } from 'react';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [activeCourse, setActiveCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([1, 3, 5]);

  const enrollInCourse = (courseId) => {
    setEnrolledCourses(prev => [...new Set([...prev, courseId])]);
  };

  const unenrollFromCourse = (courseId) => {
    setEnrolledCourses(prev => prev.filter(id => id !== courseId));
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  return (
    <CourseContext.Provider value={{
      activeCourse,
      setActiveCourse,
      enrolledCourses,
      enrollInCourse,
      unenrollFromCourse,
      isEnrolled,
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourse = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
};

export default CourseContext;
