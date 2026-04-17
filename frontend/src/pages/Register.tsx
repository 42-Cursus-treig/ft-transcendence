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
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{t('auth.registerTitle')}</h1>
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
          <label className="block text-sm mb-1" htmlFor="username">{t('auth.username')}</label>
          <input
            id="username" type="text" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            autoComplete="username"
          />
          {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            autoComplete="new-password"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          <p className="text-muted text-xs mt-1">{t('auth.passwordHint')}</p>
        </div>
        {errors.form && <p className="text-red-400 text-sm">{errors.form}</p>}
        <button
          type="submit" disabled={submitting}
          className="w-full bg-accent hover:opacity-90 disabled:opacity-50 rounded-md py-2 font-medium"
        >
          {submitting ? t('auth.registerSubmitting') : t('auth.registerSubmit')}
        </button>
      </form>
      <p className="text-muted text-sm mt-4">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-accent hover:underline">{t('auth.loginLink')}</Link>
      </p>
    </div>
  );
}