import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-4xl md:text-6xl mb-4 neon text-accent">
        PONG
      </h1>
      <p className="font-body text-2xl text-accent-cyan mb-12 neon-cyan">
        &gt; ft_transcendence<span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel mx-auto max-w-2xl mb-12">
        <pre className="text-accent text-sm md:text-base leading-none whitespace-pre">
{`╔══════════════════════════════════════╗
║                                      ║
║  █                              █    ║
║  █           ●                  █    ║
║  █                              █    ║
║  █                              █    ║
║                                      ║
╚══════════════════════════════════════╝`}
        </pre>
        <div className="mt-6 font-body text-xl text-text">
          {user ? (
            <>
              <p className="mb-2">
                &gt; {t('home.welcomeUser', { username: user.username })}
              </p>
              <p className="text-muted">{t('home.ctaAuthenticated')}</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-accent-cyan">&gt; INSERT COIN</p>
              <p className="text-muted">{t('home.ctaAnonymous')}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {user ? (
          <Link to="/play" className="btn-arcade-primary">
            &gt; PLAY
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn-arcade-primary">
              &gt; {t('common.register')}
            </Link>
            <Link to="/login" className="btn-arcade-primary">
              &gt; {t('common.login')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}