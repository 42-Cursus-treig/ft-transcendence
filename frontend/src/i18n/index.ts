import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const STORAGE_KEY = 'ft_lang';

function detectInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
      return saved as SupportedLanguage;
    }
  } catch {}

  const browserLang = navigator.language?.toLowerCase().slice(0, 2);
  if (browserLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(browserLang)) {
    return browserLang as SupportedLanguage;
  }

  return 'fr';
}

export function setLanguage(lang: SupportedLanguage): void {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
    },
    lng: detectInitialLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;