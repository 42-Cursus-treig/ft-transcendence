import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-2xl neon text-accent mb-2">
        &gt; PLAYER CARD
      </h1>
      <p className="font-body text-base text-muted mb-8">
        {t('profile.title').toUpperCase()}<span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel font-body text-xl space-y-4">
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.username')}
          </span>
          <span className="text-text">{user.username}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.email')}
          </span>
          <span className="text-text">{user.email}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.userId')}
          </span>
          <span className="text-muted text-sm break-all">{user.id}</span>
        </div>

        <div className="border-t-2 border-border pt-4 mt-6">
          <p className="text-muted text-base">
            &gt; STATS: <span className="text-accent-cyan">COMING_SOON.EXE</span>
          </p>
        </div>
      </div>
    </div>
  );
}