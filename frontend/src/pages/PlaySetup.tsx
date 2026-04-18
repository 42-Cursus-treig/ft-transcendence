import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { AIDifficulty } from '../game/pong/ai';

type GameMode = 'LOCAL' | 'AI';

export function PlaySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>('LOCAL');
  const [userSide, setUserSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [guestAlias, setGuestAlias] = useState('');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('NORMAL');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'LOCAL') {
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
        state: { mode: 'LOCAL', leftAlias, rightAlias, userSide },
      });
      return;
    }

    navigate('/play/match', {
      state: {
        mode: 'AI',
        leftAlias: user.username,
        rightAlias: `CPU-${aiDifficulty}`,
        userSide: 'LEFT',
        aiDifficulty,
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
          CHOOSE YOUR GAME<span className="cursor-blink"></span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <p className="font-display text-xs text-accent-cyan mb-3">MODE</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('LOCAL')}
                className={`btn-arcade ${
                  mode === 'LOCAL'
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-transparent text-accent border-accent'
                }`}
              >
                LOCAL 1V1
              </button>
              <button
                type="button"
                onClick={() => setMode('AI')}
                className={`btn-arcade ${
                  mode === 'AI'
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-transparent text-accent border-accent'
                }`}
              >
                VS CPU
              </button>
            </div>
          </div>

          {mode === 'LOCAL' ? (
            <>
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
                  You are:{' '}
                  <span className="text-accent">{user.username}</span>
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
            </>
          ) : (
            <div>
              <p className="font-display text-xs text-accent-cyan mb-3">
                CPU DIFFICULTY
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAIDifficulty(d)}
                    className={`btn-arcade ${
                      aiDifficulty === d
                        ? 'bg-accent text-bg border-accent'
                        : 'bg-transparent text-accent border-accent'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="font-body text-sm text-muted mt-2">
                You play <span className="text-accent">LEFT</span>, CPU plays{' '}
                <span className="text-accent">RIGHT</span>
              </p>
            </div>
          )}

          {error && (
            <p className="text-danger font-body text-base">
              &gt; ERR: {error}
            </p>
          )}

          <button type="submit" className="btn-arcade-primary w-full">
            &gt; START MATCH
          </button>
        </form>
      </div>
    </div>
  );
}