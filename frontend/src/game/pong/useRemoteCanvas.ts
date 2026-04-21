import { useEffect, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { render } from './renderer';
import type { GameState } from './types';
import type { Theme } from './settings';

type Options = {
  game: GameState | null;
  theme: Theme;
  aliases?: { left: string; right: string };
};

const INTERPOLATION_DELAY_MS = 100;

type Snapshot = {
  state: GameState;
  receivedAt: number;
};

export function useRemoteCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: Options,
) {
  const snapshotsRef = useRef<Snapshot[]>([]);
  const themeRef = useRef<Theme>(options.theme);
  const aliasesRef = useRef(options.aliases);

  themeRef.current = options.theme;
  aliasesRef.current = options.aliases;

  useEffect(() => {
    if (options.game) {
      snapshotsRef.current.push({
        state: options.game,
        receivedAt: performance.now(),
      });
      if (snapshotsRef.current.length > 10) {
        snapshotsRef.current.shift();
      }
    }
  }, [options.game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;

    const loop = () => {
      const snapshots = snapshotsRef.current;
      if (snapshots.length === 0) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      const renderTime = now - INTERPOLATION_DELAY_MS;

      let prev: Snapshot | null = null;
      let next: Snapshot | null = null;
      for (let i = 0; i < snapshots.length; i++) {
        if (snapshots[i].receivedAt <= renderTime) {
          prev = snapshots[i];
        } else {
          next = snapshots[i];
          break;
        }
      }

      let stateToRender: GameState;
      if (prev && next) {
        const total = next.receivedAt - prev.receivedAt;
        const elapsed = renderTime - prev.receivedAt;
        const t = total > 0 ? Math.max(0, Math.min(1, elapsed / total)) : 0;
        stateToRender = interpolateState(prev.state, next.state, t);
      } else if (prev) {
        stateToRender = prev.state;
      } else {
        stateToRender = snapshots[0].state;
      }

      render(ctx, stateToRender, themeRef.current, aliasesRef.current, { hideEndOverlay: true });
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [canvasRef]);
}

function interpolateState(prev: GameState, next: GameState, t: number): GameState {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  return {
    ...prev,
    ball: {
      ...prev.ball,
      x: lerp(prev.ball.x, next.ball.x),
      y: lerp(prev.ball.y, next.ball.y),
    },
    leftPaddle: {
      ...prev.leftPaddle,
      y: lerp(prev.leftPaddle.y, next.leftPaddle.y),
      height: lerp(prev.leftPaddle.height, next.leftPaddle.height),
    },
    rightPaddle: {
      ...prev.rightPaddle,
      y: lerp(prev.rightPaddle.y, next.rightPaddle.y),
      height: lerp(prev.rightPaddle.height, next.rightPaddle.height),
    },
    score: next.score,
    status: next.status,
    winner: next.winner,
    powerUp: next.powerUp,
    activePowerUps: next.activePowerUps,
    lastPowerUpSpawnAt: next.lastPowerUpSpawnAt,
  };
}