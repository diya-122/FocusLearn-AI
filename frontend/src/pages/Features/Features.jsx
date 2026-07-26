import React from 'react';
import { HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineClock, HiOutlineDocumentText, HiOutlineCalendar, HiOutlinePencilSquare, HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import styles from './Features.module.css';

export default function Features() {
  const featuresList = [
    {
      title: 'Attention Monitoring',
      description: 'Our AI tracks your focus levels using the webcam to detect when your attention drifts and nudges you back on track.',
      icon: <HiOutlineClock />
    },
    {
      title: 'AI Video Summaries',
      description: 'Import any video lecture and our system automatically generates a concise, readable summary of the key points.',
      icon: <HiOutlineDocumentText />
    },
    {
      title: 'Auto-Generated Quizzes',
      description: 'Test your knowledge immediately after learning with quizzes generated automatically from your course material.',
      icon: <HiOutlineAcademicCap />
    },
    {
      title: 'Advanced Analytics',
      description: 'View detailed insights into your study habits, attention spans, and quiz performance over time.',
      icon: <HiOutlineChartBar />
    },
    {
      title: 'Academic Calendar',
      description: 'Track exams, assignments, and important dates with our integrated visual calendar system.',
      icon: <HiOutlineCalendar />
    },
    {
      title: 'Smart Notes',
      description: 'Take beautiful, organized notes while you study, complete with tagging, pinning, and course linking.',
      icon: <HiOutlinePencilSquare />
    },
    {
      title: 'PDF Export',
      description: 'Download your digital notes and summaries directly to your device as clean, formatted PDF documents.',
      icon: <HiOutlineDocumentArrowDown />
    }
  ];

  return (
    <div className={styles.featuresContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Powerful Features for Smarter Learning</h1>
        <p className={styles.heroSubtitle}>
          FocusLearn AI combines cutting-edge computer vision with advanced language models to create the ultimate personalized learning environment.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {featuresList.map((feature, idx) => (
          <div key={idx} className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              {feature.icon}
            </div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
