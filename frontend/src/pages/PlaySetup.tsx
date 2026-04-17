import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function PlaySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userSide, setUserSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [guestAlias, setGuestAlias] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = guestAlias.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setError('Guest alias must be between 1 and 30 characters');
      return;
    }
    if (trimmed.toLowerCase() === user.username.toLowerCase()) {
      setError('Guest alias must differ from your username');
      return;
    }

    const leftAlias = userSide === 'LEFT' ? user.username : trimmed;
    const rightAlias = userSide === 'RIGHT' ? user.username : trimmed;

    navigate('/play/match', {
      state: {
        leftAlias,
        rightAlias,
        userSide,
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="arcade-panel">
        <h1 className="font-display text-xl neon text-accent mb-2">
          &gt; MATCH SETUP
        </h1>
        <p className="font-body text-base text-muted mb-8">
          CONFIGURE PLAYERS<span className="cursor-blink"></span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <p className="font-display text-xs text-accent-cyan mb-3">
              YOUR SIDE
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserSide('LEFT')}
                className={`btn-arcade ${
                  userSide === 'LEFT'
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-transparent text-accent border-accent'
                }`}
              >
                &lt; LEFT
              </button>
              <button
                type="button"
                onClick={() => setUserSide('RIGHT')}
                className={`btn-arcade ${
                  userSide === 'RIGHT'
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-transparent text-accent border-accent'
                }`}
              >
                RIGHT &gt;
              </button>
            </div>
            <p className="font-body text-sm text-muted mt-2">
              You are: <span className="text-accent">{user.username}</span>
            </p>
          </div>

          <div>
            <label
              className="block font-display text-xs text-accent-cyan mb-2"
              htmlFor="guestAlias"
            >
              OPPONENT NAME
            </label>
            <input
              id="guestAlias"
              type="text"
              value={guestAlias}
              onChange={(e) => setGuestAlias(e.target.value)}
              placeholder="Guest"
              maxLength={30}
              className="input-arcade"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-danger font-body text-base">&gt; ERR: {error}</p>
          )}

          <button type="submit" className="btn-arcade-primary w-full">
            &gt; START MATCH
          </button>
        </form>
      </div>
    </div>
  );
}