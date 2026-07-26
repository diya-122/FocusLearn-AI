import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हि', fullLabel: 'हिंदी', flag: '🇮🇳' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem('focuslearn_lang') || 'en'
  )

  const switchLanguage = (code) => {
    setLang(code)
    localStorage.setItem('focuslearn_lang', code)
  }

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export default LanguageContext
