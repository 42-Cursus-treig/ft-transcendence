import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { loginSchema } from '../utils/validation';
import { ApiException } from '../api/client';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{t('auth.loginTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">{t('auth.email')}</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            autoComplete="email"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            autoComplete="current-password"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>
        {errors.form && <p className="text-red-400 text-sm">{errors.form}</p>}
        <button
          type="submit" disabled={submitting}
          className="w-full bg-accent hover:opacity-90 disabled:opacity-50 rounded-md py-2 font-medium"
        >
          {submitting ? t('auth.loginSubmitting') : t('auth.loginSubmit')}
        </button>
      </form>
      <p className="text-muted text-sm mt-4">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-accent hover:underline">{t('auth.registerLink')}</Link>
      </p>
    </div>
  );
}