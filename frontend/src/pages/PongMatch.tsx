import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl neon text-accent mb-2 text-center">
        &gt; PONG
      </h1>
      <p className="font-body text-base text-muted mb-2 text-center">
        {setup.leftAlias.toUpperCase()} VS {setup.rightAlias.toUpperCase()}
        <span className="cursor-blink"></span>
      </p>
      <p className="font-body text-sm text-muted text-center mb-8">
        {settings.ballSpeed} BALL · {settings.paddleSize} PADDLES · FIRST TO {settings.scoreToWin}
        {settings.powerUpsEnabled && ' · POWER-UPS'}
      </p>

      <PongCanvas
        onMatchEnd={handleMatchEnd}
        aliases={{ left: setup.leftAlias, right: setup.rightAlias }}
        aiDifficulty={isAIMode ? setup.aiDifficulty : undefined}
        settings={settings}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div className="arcade-panel text-center">
          <p className="font-display text-xs text-accent-cyan mb-4">
            {setup.leftAlias.toUpperCase()} (LEFT)
          </p>
          <div className="flex flex-col items-center gap-2">
            <KeyCap label={keys.leftUp} />
            <KeyCap label={keys.leftDown} />
          </div>
        </div>
        <div className="arcade-panel text-center">
          <p className="font-display text-xs text-accent-cyan mb-4">
            {setup.rightAlias.toUpperCase()} (RIGHT)
          </p>
          {isAIMode ? (
            <div className="py-4">
              <p className="font-body text-lg text-accent-cyan">
                &gt; AI CONTROLLED
              </p>
              <p className="font-body text-sm text-muted mt-1">
                Difficulty: {setup.aiDifficulty}
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

      <p className="font-body text-base text-muted text-center mt-6">
        &gt; SPACE = START / PAUSE &nbsp;·&nbsp; FIRST TO {settings.scoreToWin} WINS
        <span className="cursor-blink"></span>
      </p>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/play')}
          className="font-body text-base text-muted hover:text-accent uppercase"
        >
          &lt; back to setup
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
        minWidth: '3rem',
        height: '3rem',
        padding: '0 0.75rem',
        fontSize: label.length > 1 ? '0.75rem' : '1rem',
        boxShadow: '0 0 8px rgba(57, 255, 20, 0.4), inset 0 0 8px rgba(57, 255, 20, 0.15)',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}