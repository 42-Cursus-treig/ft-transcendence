import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-accent">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg neon text-accent hover:text-accent-cyan transition-colors">
            &gt; FT_TRANSCENDENCE
          </Link>
          <nav className="flex items-center gap-6 font-body text-lg">
            {user ? (
              <>
                <Link to="/profile" className="text-accent-cyan hover:text-accent neon-cyan">
                  [ {user.username} ]
                </Link>
                <button onClick={logout} className="text-muted hover:text-danger uppercase">
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted hover:text-accent uppercase">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="btn-arcade-primary">
                  {t('common.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-between items-center font-body text-base text-muted">
          <span className="font-display text-xs">{t('footer.copyright')}</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent uppercase">
              {t('nav.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-accent uppercase">
              {t('nav.terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}