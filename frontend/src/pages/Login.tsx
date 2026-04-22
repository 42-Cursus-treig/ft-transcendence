import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { loginSchema } from '../utils/validation';
import { ApiException } from '../api/client';
import { useSearchParams } from 'react-router-dom';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('oauth_error');

  const oauthErrorMessage = oauthError === 'denied'
    ? t('auth.oauthDenied')
    : oauthError === 'state_mismatch'
    ? t('auth.oauthStateMismatch')
    : oauthError === 'server_error'
    ? t('auth.oauthServerError')
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (msgs?.[0]) fieldErrors[field] = msgs[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors({ form: t('auth.invalidCredentials') });
      } else {
        setErrors({ form: t('auth.unexpectedError') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="arcade-panel">
        <h1 className="font-display text-xl neon text-accent mb-2">
          &gt; {t('auth.loginTitle')}
        </h1>
        <p className="font-body text-base text-muted mb-8">
          {t('auth.loginTitle').toUpperCase()}<span className="cursor-blink"></span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block font-display text-xs text-accent-cyan mb-2" htmlFor="email">
              {t('auth.email').toUpperCase()}
            </label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-arcade"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-danger font-body text-base mt-1">&gt; ERR: {errors.email}</p>
            )}
          </div>
          <div>
            <label className="block font-display text-xs text-accent-cyan mb-2" htmlFor="password">
              {t('auth.password').toUpperCase()}
            </label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-arcade"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-danger font-body text-base mt-1">&gt; ERR: {errors.password}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-danger font-body text-lg">&gt; {errors.form}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-arcade-primary w-full">
            {submitting ? `> ${t('auth.loginSubmitting')}` : `> ${t('auth.loginSubmit')}`}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-border"></div>
          <span className="font-body text-sm text-muted">·</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <a
          href="/api/auth/oauth/42/start"
          className="btn-arcade-primary w-full block text-center"
        >
          &gt; {t('auth.signInWith42')}
        </a>

        {oauthErrorMessage && (
          <p className="text-danger font-body text-base mt-4">
            &gt; {t('auth.oauthError').toUpperCase()}: {oauthErrorMessage}
          </p>
        )}

        <p className="font-body text-base text-muted mt-6 text-center">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="arcade-link">
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}