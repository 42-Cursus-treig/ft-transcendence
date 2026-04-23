import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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

      <div className="arcade-panel mx-auto max-w-2xl mb-8 sm:mb-12 overflow-hidden">
        <div className="hidden xs:block sm:block overflow-x-auto">
          <pre className="text-accent text-xs sm:text-sm md:text-base leading-none whitespace-pre font-body text-left sm:text-center">
{`╔══════════════════════════════════════╗
║                                      ║
║  █                              █    ║
║  █           ●                  █    ║
║  █                              █    ║
║  █                              █    ║
║                                      ║
╚══════════════════════════════════════╝`}
          </pre>
        </div>

        <div className="block sm:hidden">
          <div
            className="border-2 border-accent mx-auto relative"
            style={{ width: '100%', aspectRatio: '8 / 3', maxWidth: 320 }}
          >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>

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

      <div className="flex flex-wrap gap-4 justify-center">
        {user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link to="/play" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('home.playLocal')}
            </Link>
            <Link to="/remote" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('home.playOnline')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link to="/register" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('common.register')}
            </Link>
            <Link to="/login" className="btn-arcade-primary w-full sm:w-auto">
              &gt; {t('common.login')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}