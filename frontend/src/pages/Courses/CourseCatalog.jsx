import { useState, useMemo } from 'react';
import CourseCard from '../../components/CourseCard/CourseCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { courses, categories, difficulties } from '../../utils/mockData';
import styles from './CourseCatalog.module.css';

export default function CourseCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('popular');

  const filtered = useMemo(() => {
    let result = [...courses];
    if (category !== 'All') result = result.filter(c => c.category === category);
    if (difficulty !== 'All') result = result.filter(c => c.difficulty === difficulty);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sort === 'popular') result.sort((a, b) => b.students - a.students);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') result.sort((a, b) => b.id - a.id);
    return result;
  }, [search, category, difficulty, sort]);

  return (
    <div className={styles.catalog}>
      <div className={styles.catalogHeader}>
        <h2>Course Catalog</h2>
        <div className={styles.filters}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." />
          <select className={styles.filterSelect} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Levels' : d}</option>)}
          </select>
          <select className={styles.filterSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className={styles.tabsRow}>
        {categories.map(cat => (
          <button key={cat} className={`${styles.tab} ${category === cat ? styles.active : ''}`}
            onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <p className={styles.resultCount}>{filtered.length} courses found</p>

      <div className={styles.coursesGrid}>
        {filtered.length > 0 ? (
          filtered.map(course => <CourseCard key={course.id} course={course} />)
        ) : (
          <div className={styles.emptyState}>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
