import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PongCourtSVG } from '../components/PongCourtSVG';

export function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl md:text-6xl mb-4 neon text-accent">
        PONG
      </h1>
      <p className="font-body text-xl sm:text-2xl text-accent-cyan mb-8 sm:mb-12 neon-cyan">
        &gt; ft_transcendence<span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel mx-auto max-w-2xl mb-8 sm:mb-12">
        <PongCourtSVG />

        <div className="mt-6 font-body text-lg sm:text-xl text-text px-2">
          {user ? (
            <>
              <p className="mb-2">
                &gt; {t('home.welcomeUser', { username: user.username })}
              </p>
              <p className="text-muted">{t('home.ctaAuthenticated')}</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-accent-cyan">&gt; {t('home.insertCoin')}</p>
              <p className="text-muted">{t('home.ctaAnonymous')}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user ? (
          <>
            <Link to="/play" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('home.playLocal')}
            </Link>
            <Link to="/remote" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('home.playOnline')}
            </Link>
          </>
        ) : (
          <>
            <Link to="/register" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('common.register')}
            </Link>
            <Link to="/login" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('common.login')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}