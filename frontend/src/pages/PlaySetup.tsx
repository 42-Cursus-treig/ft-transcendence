import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { AIDifficulty } from '../game/pong/ai';
import {
  DEFAULT_SETTINGS,
  type GameSettings,
} from '../game/pong/settings';

type GameMode = 'LOCAL' | 'AI';

export function PlaySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>('LOCAL');
  const [userSide, setUserSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [guestAlias, setGuestAlias] = useState('');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('NORMAL');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [error, setError] = useState('');

  if (!user) return null;

  const updateSettings = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => setSettings((s) => ({ ...s, [key]: value }));

  const resetToDefault = () => setSettings(DEFAULT_SETTINGS);

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
        state: { mode: 'LOCAL', leftAlias, rightAlias, userSide, settings },
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
        settings,
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
          <SettingSection label="MODE">
            <div className="grid grid-cols-2 gap-3">
              <ToggleButton active={mode === 'LOCAL'} onClick={() => setMode('LOCAL')}>
                LOCAL 1V1
              </ToggleButton>
              <ToggleButton active={mode === 'AI'} onClick={() => setMode('AI')}>
                VS CPU
              </ToggleButton>
            </div>
          </SettingSection>

          {mode === 'LOCAL' ? (
            <>
              <SettingSection label="YOUR SIDE">
                <div className="grid grid-cols-2 gap-3">
                  <ToggleButton active={userSide === 'LEFT'} onClick={() => setUserSide('LEFT')}>
                    &lt; LEFT
                  </ToggleButton>
                  <ToggleButton active={userSide === 'RIGHT'} onClick={() => setUserSide('RIGHT')}>
                    RIGHT &gt;
                  </ToggleButton>
                </div>
                <p className="font-body text-sm text-muted mt-2">
                  You are: <span className="text-accent">{user.username}</span>
                </p>
              </SettingSection>

              <SettingSection label="OPPONENT NAME">
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
              </SettingSection>
            </>
          ) : (
            <SettingSection label="CPU DIFFICULTY">
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as const).map((d) => (
                  <ToggleButton
                    key={d}
                    active={aiDifficulty === d}
                    onClick={() => setAIDifficulty(d)}
                  >
                    {d}
                  </ToggleButton>
                ))}
              </div>
              <p className="font-body text-sm text-muted mt-2">
                You play <span className="text-accent">LEFT</span>, CPU plays{' '}
                <span className="text-accent">RIGHT</span>
              </p>
            </SettingSection>
          )}

          <div className="border-t-2 border-border pt-6 flex items-center justify-between">
            <h2 className="font-display text-sm text-accent-cyan">
              &gt; CUSTOMIZATION
            </h2>
            <button
              type="button"
              onClick={resetToDefault}
              className="font-body text-sm text-muted hover:text-accent uppercase"
            >
              reset defaults
            </button>
          </div>

          <SettingSection label="BALL SPEED">
            <div className="grid grid-cols-3 gap-2">
              {(['SLOW', 'NORMAL', 'FAST'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.ballSpeed === v}
                  onClick={() => updateSettings('ballSpeed', v)}
                >
                  {v}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label="PADDLE SIZE">
            <div className="grid grid-cols-3 gap-2">
              {(['SMALL', 'NORMAL', 'LARGE'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.paddleSize === v}
                  onClick={() => updateSettings('paddleSize', v)}
                >
                  {v}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label="SCORE TO WIN">
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 7] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.scoreToWin === v}
                  onClick={() => updateSettings('scoreToWin', v)}
                >
                  {v} PTS
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label="THEME">
            <div className="grid grid-cols-3 gap-2">
              {(['CLASSIC', 'SYNTHWAVE', 'MONO'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.theme === v}
                  onClick={() => updateSettings('theme', v)}
                >
                  {v}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label="POWER-UPS">
            <div className="grid grid-cols-2 gap-3">
              <ToggleButton
                active={!settings.powerUpsEnabled}
                onClick={() => updateSettings('powerUpsEnabled', false)}
              >
                OFF
              </ToggleButton>
              <ToggleButton
                active={settings.powerUpsEnabled}
                onClick={() => updateSettings('powerUpsEnabled', true)}
              >
                ON
              </ToggleButton>
            </div>
            <p className="font-body text-sm text-muted mt-2">
              // Hit power-ups with the ball to boost your paddle
            </p>
          </SettingSection>

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

function SettingSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-xs text-accent-cyan mb-3">{label}</p>
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-arcade ${
        active
          ? 'bg-accent text-bg border-accent'
          : 'bg-transparent text-accent border-accent'
      }`}
    >
      {children}
    </button>
  );
}