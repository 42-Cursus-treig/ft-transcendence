import { useEffect, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { createInitialState, updateGame, handleSpacePressed } from './engine';
import { render } from './renderer';
import { useKeyboardInput } from './useKeyboardInput';
import type { GameState } from './types';

type UsePongGameOptions = {
  onMatchEnd?: (finalState: GameState, startedAt: Date, endedAt: Date) => void;
  aliases?: { left: string; right: string };
};

export function usePongGame(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: UsePongGameOptions = {},
) {
  const stateRef = useRef(createInitialState());
  const matchStartRef = useRef<Date | null>(null);
  const matchEndedFiredRef = useRef(false);

  const onMatchEndRef = useRef(options.onMatchEnd);
  onMatchEndRef.current = options.onMatchEnd;

  const aliasesRef = useRef(options.aliases);
  aliasesRef.current = options.aliases;

  const inputRef = useKeyboardInput({
    onSpace: () => {
      const prev = stateRef.current;
      const next = handleSpacePressed(prev);
      stateRef.current = next;

      if (prev.status === 'idle' && next.status === 'playing') {
        matchStartRef.current = new Date();
        matchEndedFiredRef.current = false;
      }

      if (prev.status === 'finished' && next.status === 'idle') {
        matchStartRef.current = null;
      }
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const prev = stateRef.current;
      const next = updateGame(prev, inputRef.current, dt);
      stateRef.current = next;

      if (
        prev.status === 'playing' &&
        next.status === 'finished' &&
        !matchEndedFiredRef.current &&
        matchStartRef.current
      ) {
        matchEndedFiredRef.current = true;
        onMatchEndRef.current?.(next, matchStartRef.current, new Date());
      }

      render(ctx, next, options.aliases);
      render(ctx, next, aliasesRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [canvasRef, inputRef]);
}