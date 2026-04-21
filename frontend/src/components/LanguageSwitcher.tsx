import { useTranslation } from 'react-i18next';
import { setLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  return (
    <label className="flex items-center gap-2 font-body text-sm">
      <span className="text-muted">&gt; {t('language.label').toUpperCase()}:</span>
      <select
        value={current}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="bg-bg border border-accent text-accent px-2 py-1 font-body text-sm cursor-pointer focus:outline-none focus:border-accent-cyan"
        aria-label={t('language.label')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {t(`language.${lang}`)}
          </option>
        ))}
      </select>
    </label>
  );
}