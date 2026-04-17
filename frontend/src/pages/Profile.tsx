import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      <dl className="space-y-3">
        <div className="flex gap-3">
          <dt className="text-muted w-32">{t('profile.username')}</dt>
          <dd>{user.username}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="text-muted w-32">{t('profile.email')}</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="text-muted w-32">{t('profile.userId')}</dt>
          <dd className="font-mono text-sm">{user.id}</dd>
        </div>
      </dl>
    </div>
  );
}