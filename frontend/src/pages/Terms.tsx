import { useTranslation } from 'react-i18next';

export function Terms() {
  const { t } = useTranslation();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6 leading-relaxed">
      <header>
        <h1 className="text-3xl font-bold mb-2">{t('legal.terms.title')}</h1>
        <p className="text-muted text-sm">{t('legal.lastUpdated')}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s1Title')}</h2>
        <p>{t('legal.terms.s1Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s2Title')}</h2>
        <p>{t('legal.terms.s2Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s3Title')}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t('legal.terms.s3Item1')}</li>
          <li>{t('legal.terms.s3Item2')}</li>
          <li>{t('legal.terms.s3Item3')}</li>
          <li>{t('legal.terms.s3Item4')}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s4Title')}</h2>
        <p>{t('legal.terms.s4Intro')}</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>{t('legal.terms.s4Item1')}</li>
          <li>{t('legal.terms.s4Item2')}</li>
          <li>{t('legal.terms.s4Item3')}</li>
          <li>{t('legal.terms.s4Item4')}</li>
          <li>{t('legal.terms.s4Item5')}</li>
        </ul>
        <p className="mt-2">{t('legal.terms.s4Outro')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s5Title')}</h2>
        <p>{t('legal.terms.s5Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s6Title')}</h2>
        <p>{t('legal.terms.s6Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s7Title')}</h2>
        <p>{t('legal.terms.s7Body')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('legal.terms.s8Title')}</h2>
        <p>{t('legal.terms.s8Body')}</p>
      </section>
    </article>
  );
}