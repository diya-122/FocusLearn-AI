import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Search courses...' }) {
  return (
    <div className={styles.searchBar}>
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clearBtn} onClick={() => onChange('')}>
          <FaTimes />
        </button>
      )}
    </div>
  );
}
