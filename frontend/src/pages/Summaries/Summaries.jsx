import { useState } from 'react';
import { FaCopy, FaDownload, FaChevronDown } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { formatDate } from '../../utils/helpers';
import styles from './Summaries.module.css';

const summaries = [];

export default function Summaries() {
  const [expanded, setExpanded] = useState({});

  const toggleSection = (summaryId, sectionIdx) => {
    const key = `${summaryId}-${sectionIdx}`;
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copySummary = (summary) => {
    const text = summary.sections.map(s => `${s.title}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.summariesPage}>
      <div className={styles.pageHeader}>
        <h2>AI-Generated Summaries</h2>
        <button className="btn btn-primary btn-sm">
          <HiOutlineSparkles /> Generate New
        </button>
      </div>

      <div className={styles.summariesGrid}>
        {summaries.map(summary => (
          <div key={summary.id} className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryMeta}>
                <h3>{summary.lessonTitle}</h3>
                <p>Generated on {formatDate(summary.generatedAt)}</p>
              </div>
              <div className={styles.summaryActions}>
                <button className={styles.actionBtn} title="Copy" onClick={() => copySummary(summary)}>
                  <FaCopy />
                </button>
                <button className={styles.actionBtn} title="Download PDF">
                  <FaDownload />
                </button>
              </div>
            </div>

            <div className={styles.summaryCardBody}>
              {summary.sections.map((section, i) => {
                const key = `${summary.id}-${i}`;
                const isExpanded = expanded[key] !== false;
                return (
                  <div key={i} className={styles.section}>
                    <div className={styles.sectionHeader} onClick={() => toggleSection(summary.id, i)}>
                      <h4>
                        {section.title}
                        {section.isKey && <span className={styles.keyBadge}>KEY</span>}
                      </h4>
                      <FaChevronDown className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`} />
                    </div>
                    {isExpanded && <p className={styles.sectionContent}>{section.content}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
