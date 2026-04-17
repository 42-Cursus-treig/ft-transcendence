import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">ft_transcendence</Link>
          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link to="/profile" className="hover:text-accent">{user.username}</Link>
                <button onClick={logout} className="hover:text-accent">{t('common.logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent">{t('common.login')}</Link>
                <Link
                  to="/register"
                  className="bg-accent px-3 py-1.5 rounded-md text-white hover:opacity-90"
                >
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-between text-sm text-muted">
          <span>{t('footer.copyright')}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-text">{t('nav.privacy')}</Link>
            <Link to="/terms" className="hover:text-text">{t('nav.terms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}