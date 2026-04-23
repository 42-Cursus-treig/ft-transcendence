import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PongCanvas } from '../game/pong/PongCanvas';
import { useKeyLabels } from '../game/pong/useKeyLabels';
import { matchApi } from '../api/matches';
import type { GameState } from '../game/pong/types';
import type { AIDifficulty } from '../game/pong/ai';
import { DEFAULT_SETTINGS, type GameSettings } from '../game/pong/settings';

type MatchSetupState =
  | {
      mode: 'LOCAL';
      leftAlias: string;
      rightAlias: string;
      userSide: 'LEFT' | 'RIGHT';
      settings?: GameSettings;
    }
  | {
      mode: 'AI';
      leftAlias: string;
      rightAlias: string;
      userSide: 'LEFT';
      aiDifficulty: AIDifficulty;
      settings?: GameSettings;
    };

export function PongMatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const keys = useKeyLabels();
  const { t } = useTranslation();

  const setup = location.state as MatchSetupState | null;
  if (!setup) {
    return <Navigate to="/play" replace />;
  }

  const settings = setup.settings ?? DEFAULT_SETTINGS;

  const handleMatchEnd = useCallback(
    async (finalState: GameState, startedAt: Date, endedAt: Date) => {
      if (!finalState.winner) return;

      try {
        await matchApi.create({
          mode: setup.mode,
          winnerSide: finalState.winner === 'left' ? 'LEFT' : 'RIGHT',
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          participants: [
            {
              alias: setup.leftAlias,
              side: 'LEFT',
              score: finalState.score.left,
              isCurrentUser: setup.userSide === 'LEFT',
            },
            {
              alias: setup.rightAlias,
              side: 'RIGHT',
              score: finalState.score.right,
              isCurrentUser:
                setup.mode === 'LOCAL' && setup.userSide === 'RIGHT',
            },
          ],
        });
      } catch (err) {
        console.error('Failed to save match:', err);
      }
    },
    [setup],
  );

  const isAIMode = setup.mode === 'AI';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-display text-lg sm:text-2xl neon text-accent mb-2 text-center">
        &gt; {t('pong.title')}
      </h1>
      <p className="font-body text-base text-muted mb-2 text-center">
        {setup.leftAlias.toUpperCase()} {t('pong.vs')} {setup.rightAlias.toUpperCase()}
        <span className="cursor-blink"></span>
      </p>
      <p className="font-body text-xs sm:text-sm text-muted text-center mb-6 sm:mb-8 px-2">
        {t(`play.${settings.ballSpeed.toLowerCase()}`)} {t('play.ballSpeed')} ·
        {' '}{t(`play.${settings.paddleSize.toLowerCase()}`)} {t('play.paddleSize')} ·
        {' '}{t('pong.firstToWins', { score: settings.scoreToWin })}
        {settings.powerUpsEnabled && ` · ${t('play.powerUps')}`}
      </p>

      <PongCanvas
        onMatchEnd={handleMatchEnd}
        aliases={{ left: setup.leftAlias, right: setup.rightAlias }}
        aiDifficulty={isAIMode ? setup.aiDifficulty : undefined}
        settings={settings}
      />

      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto">
        <div className="arcade-panel text-center p-3 sm:p-6">
          <p className="font-display text-xs text-accent-cyan mb-3 truncate">
            {setup.leftAlias.toUpperCase()} ({t('play.left')})
          </p>
          <div className="flex flex-col items-center gap-2">
            <KeyCap label={keys.leftUp} />
            <KeyCap label={keys.leftDown} />
          </div>
        </div>
        <div className="arcade-panel text-center p-3 sm:p-6">
          <p className="font-display text-xs text-accent-cyan mb-3 truncate">
            {setup.rightAlias.toUpperCase()} ({t('play.right')})
          </p>
          {isAIMode ? (
            <div className="py-2">
              <p className="font-body text-base text-accent-cyan">
                &gt; {t('pong.aiControlled')}
              </p>
              <p className="font-body text-xs sm:text-sm text-muted mt-1">
                {t('pong.difficulty')}: {t(`play.${setup.aiDifficulty.toLowerCase()}`)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <KeyCap label={keys.rightUp} />
              <KeyCap label={keys.rightDown} />
            </div>
          )}
        </div>
      </div>

      <p className="font-body text-sm sm:text-base text-muted text-center mt-4 sm:mt-6 px-2">
        &gt; {t('pong.spaceStart')} &nbsp;·&nbsp; {t('pong.firstToWins', { score: settings.scoreToWin }).toUpperCase()}
        <span className="cursor-blink"></span>
      </p>

      <div className="text-center mt-6 sm:mt-8">
        <button
          onClick={() => navigate('/play')}
          className="font-body text-base text-muted hover:text-accent uppercase"
        >
          &lt; {t('play.backToSetup')}
        </button>
      </div>
    </div>
  );
}

function KeyCap({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center border-2 border-accent text-accent font-display"
      style={{
        minWidth: '2.5rem',
        height: '2.5rem',
        padding: '0 0.5rem',
        fontSize: label.length > 1 ? '0.65rem' : '0.9rem',
        boxShadow: '0 0 8px rgba(57, 255, 20, 0.4), inset 0 0 8px rgba(57, 255, 20, 0.15)',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}