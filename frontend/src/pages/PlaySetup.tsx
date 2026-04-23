import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import type { AIDifficulty } from '../game/pong/ai';
import {
  DEFAULT_SETTINGS,
  type GameSettings,
} from '../game/pong/settings';
import { useSessionStorage } from '../hooks/useSessionStorage';

type GameMode = 'LOCAL' | 'AI';

export function PlaySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useSessionStorage<GameMode>('pong.setup.mode', 'LOCAL');
  const [userSide, setUserSide] = useSessionStorage<'LEFT' | 'RIGHT'>('pong.setup.userSide', 'LEFT');
  const [guestAlias, setGuestAlias] = useSessionStorage<string>('pong.setup.guestAlias', '');
  const [aiDifficulty, setAIDifficulty] = useSessionStorage<AIDifficulty>(
    'pong.setup.aiDifficulty',
    'NORMAL',
  );
  const [settings, setSettings, resetSettings] = useSessionStorage<GameSettings>(
    'pong.setup.settings',
    DEFAULT_SETTINGS,
  );
  const [error, setError] = useState('');

  if (!user) return null;

  const updateSettings = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => setSettings({ ...settings, [key]: value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'LOCAL') {
      const trimmed = guestAlias.trim();
      if (trimmed.length < 1 || trimmed.length > 30) {
        setError(t('validation.aliasLength'));
        return;
      }
      if (trimmed.toLowerCase() === user.username.toLowerCase()) {
        setError(t('validation.aliasDifferent'));
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
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
      <div className="arcade-panel">
        <h1 className="font-display text-base sm:text-xl neon text-accent mb-2">
          &gt; {t('play.setupTitle').toUpperCase()}
        </h1>
        <p className="font-body text-base text-muted mb-6 sm:mb-8">
          {t('play.chooseGame')}<span className="cursor-blink"></span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <SettingSection label={t('play.mode')}>
            <div className="grid grid-cols-2 gap-3">
              <ToggleButton active={mode === 'LOCAL'} onClick={() => setMode('LOCAL')}>
                {t('play.localVs')}
              </ToggleButton>
              <ToggleButton active={mode === 'AI'} onClick={() => setMode('AI')}>
                {t('play.vsCpu')}
              </ToggleButton>
            </div>
          </SettingSection>

          {mode === 'LOCAL' ? (
            <>
              <SettingSection label={t('play.yourSide')}>
                <div className="grid grid-cols-2 gap-3">
                  <ToggleButton active={userSide === 'LEFT'} onClick={() => setUserSide('LEFT')}>
                    &lt; {t('play.left')}
                  </ToggleButton>
                  <ToggleButton active={userSide === 'RIGHT'} onClick={() => setUserSide('RIGHT')}>
                    {t('play.right')} &gt;
                  </ToggleButton>
                </div>
                <p className="font-body text-sm text-muted mt-2">
                  {t('play.youAre')}: <span className="text-accent">{user.username}</span>
                </p>
              </SettingSection>

              <SettingSection label={t('play.opponentName')}>
                <input
                  id="guestAlias"
                  type="text"
                  value={guestAlias}
                  onChange={(e) => setGuestAlias(e.target.value)}
                  placeholder={t('play.guestPlaceholder')}
                  maxLength={30}
                  className="input-arcade"
                  autoComplete="off"
                />
              </SettingSection>
            </>
          ) : (
            <SettingSection label={t('play.cpuDifficulty')}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as const).map((d) => (
                  <ToggleButton
                    key={d}
                    active={aiDifficulty === d}
                    onClick={() => setAIDifficulty(d)}
                  >
                    {t(`play.${d.toLowerCase()}`)}
                  </ToggleButton>
                ))}
              </div>
              <p className="font-body text-sm text-muted mt-2">
                {t('play.cpuPlaysRight', {
                  side: t('play.left'),
                  otherSide: t('play.right'),
                })}
              </p>
            </SettingSection>
          )}

          <div className="border-t-2 border-border pt-6 flex items-center justify-between gap-2">
            <h2 className="font-display text-xs sm:text-sm text-accent-cyan">
              &gt; {t('play.customization')}
            </h2>
            <button
              type="button"
              onClick={resetSettings}
              className="font-body text-sm text-muted hover:text-accent uppercase shrink-0"
            >
              {t('play.resetDefaults')}
            </button>
          </div>

          <SettingSection label={t('play.ballSpeed')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['SLOW', 'NORMAL', 'FAST'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.ballSpeed === v}
                  onClick={() => updateSettings('ballSpeed', v)}
                >
                  {t(`play.${v.toLowerCase()}`)}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label={t('play.paddleSize')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['SMALL', 'NORMAL', 'LARGE'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.paddleSize === v}
                  onClick={() => updateSettings('paddleSize', v)}
                >
                  {t(`play.${v.toLowerCase()}`)}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label={t('play.scoreToWin')}>
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 7] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.scoreToWin === v}
                  onClick={() => updateSettings('scoreToWin', v)}
                >
                  {v} {t('play.points')}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label={t('play.theme')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['CLASSIC', 'SYNTHWAVE', 'MONO'] as const).map((v) => (
                <ToggleButton
                  key={v}
                  active={settings.theme === v}
                  onClick={() => updateSettings('theme', v)}
                >
                  {t(`play.${v.toLowerCase()}`)}
                </ToggleButton>
              ))}
            </div>
          </SettingSection>

          <SettingSection label={t('play.powerUps')}>
            <div className="grid grid-cols-2 gap-3">
              <ToggleButton
                active={!settings.powerUpsEnabled}
                onClick={() => updateSettings('powerUpsEnabled', false)}
              >
                {t('play.off')}
              </ToggleButton>
              <ToggleButton
                active={settings.powerUpsEnabled}
                onClick={() => updateSettings('powerUpsEnabled', true)}
              >
                {t('play.on')}
              </ToggleButton>
            </div>
            <p className="font-body text-sm text-muted mt-2">
              // {t('play.powerUpsHint')}
            </p>
          </SettingSection>

          {error && (
            <p className="text-danger font-body text-base">
              &gt; ERR: {error}
            </p>
          )}

          <button type="submit" className="btn-arcade-primary w-full">
            &gt; {t('play.startMatch')}
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
      className={`btn-arcade w-full text-center ${
        active
          ? 'bg-accent text-bg border-accent'
          : 'bg-transparent text-accent border-accent'
      }`}
    >
      {children}
    </button>
  );
}