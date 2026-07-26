import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import styles from './LanguageSwitcher.module.css'

export default function LanguageSwitcher() {
  const { lang, switchLanguage, LANGUAGES } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Switch language"
        title="Switch language"
      >
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.label}>{current.label}</span>
        <span className={`${styles.chevron} ${open ? styles.open : ''}`}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`${styles.option} ${l.code === lang ? styles.active : ''}`}
              onClick={() => { switchLanguage(l.code); setOpen(false) }}
            >
              <span className={styles.flag}>{l.flag}</span>
              <span>{l.fullLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
