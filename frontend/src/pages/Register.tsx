import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { registerSchema } from '../utils/validation';
import { ApiException } from '../api/client';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse({ email, username, password });
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
      await register(email, username, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors({ form: t('auth.emailOrUsernameTaken') });
      } else {
        setErrors({ form: t('auth.unexpectedError') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-16">
      <div className="arcade-panel">
        <h1 className="font-display text-base sm:text-xl neon text-accent mb-2">
          &gt; {t('auth.registerTitle')}
        </h1>
        <p className="font-body text-base text-muted mb-6 sm:mb-8">
          {t('auth.registerTitle').toUpperCase()}<span className="cursor-blink"></span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
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
            <label className="block font-display text-xs text-accent-cyan mb-2" htmlFor="username">
              {t('auth.username').toUpperCase()}
            </label>
            <input
              id="username" type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-arcade"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-danger font-body text-base mt-1">&gt; ERR: {errors.username}</p>
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
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-danger font-body text-base mt-1">&gt; ERR: {errors.password}</p>
            )}
            <p className="font-body text-sm text-muted mt-1">// {t('auth.passwordHint')}</p>
          </div>

          {errors.form && (
            <p className="text-danger font-body text-lg">&gt; {errors.form}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-arcade-primary w-full">
            {submitting ? `> ${t('auth.registerSubmitting')}` : `> ${t('auth.registerSubmit')}`}
          </button>
        </form>

        <p className="font-body text-base text-muted mt-5 sm:mt-6 text-center">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="arcade-link">
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}