import { useTranslation } from 'react-i18next';

export function Privacy() {
  const { t } = useTranslation();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6 leading-relaxed">
      <header>
        <h1 className="text-3xl font-bold mb-2">{t('legal.privacy.title')}</h1>
        <p className="text-muted text-sm">{t('legal.lastUpdated')}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s1Title')}</h2>
        <p>{t('legal.privacy.s1Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s2Title')}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>{t('legal.privacy.s2Item1Strong')}</strong>{t('legal.privacy.s2Item1')}</li>
          <li><strong>{t('legal.privacy.s2Item2Strong')}</strong>{t('legal.privacy.s2Item2')}</li>
          <li><strong>{t('legal.privacy.s2Item3Strong')}</strong>{t('legal.privacy.s2Item3')}</li>
          <li><strong>{t('legal.privacy.s2Item4Strong')}</strong>{t('legal.privacy.s2Item4')}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s3Title')}</h2>
        <p>{t('legal.privacy.s3Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s4Title')}</h2>
        <p>{t('legal.privacy.s4Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s5Title')}</h2>
        <p>{t('legal.privacy.s5Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s6Title')}</h2>
        <p>{t('legal.privacy.s6Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.privacy.s7Title')}</h2>
        <p>{t('legal.privacy.s7Body')}</p>
      </section>
    </article>
  );
}