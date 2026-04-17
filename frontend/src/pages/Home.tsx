import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">
        {user ? t('home.welcomeUser', { username: user.username }) : t('home.welcomeAnonymous')}
      </h1>
      <p className="text-muted">
        {user ? t('home.ctaAuthenticated') : t('home.ctaAnonymous')}
      </p>
    </div>
  );
}