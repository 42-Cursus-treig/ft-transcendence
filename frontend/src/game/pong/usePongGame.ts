import { useEffect, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { createInitialState, updateGame, handleSpacePressed } from './engine';
import { render } from './renderer';
import { useKeyboardInput } from './useKeyboardInput';
import { createAIState, updateAI, type AIDifficulty } from './ai';
import { DEFAULT_SETTINGS, resolveSettings, type GameSettings } from './settings';
import type { GameState, Input } from './types';

type UsePongGameOptions = {
  onMatchEnd?: (finalState: GameState, startedAt: Date, endedAt: Date) => void;
  aliases?: { left: string; right: string };
  aiDifficulty?: AIDifficulty;
  settings?: GameSettings;
};

export function usePongGame(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: UsePongGameOptions = {},
) {
  const settings = options.settings ?? DEFAULT_SETTINGS;
  const resolvedSettings = resolveSettings(settings);

  const stateRef = useRef(createInitialState(resolvedSettings));
  const matchStartRef = useRef<Date | null>(null);
  const matchEndedFiredRef = useRef(false);
  const aiStateRef = useRef(createAIState(GAME_HEIGHT / 2));

  const onMatchEndRef = useRef(options.onMatchEnd);
  onMatchEndRef.current = options.onMatchEnd;

  const aliasesRef = useRef(options.aliases);
  aliasesRef.current = options.aliases;

  const aiDifficultyRef = useRef(options.aiDifficulty);
  aiDifficultyRef.current = options.aiDifficulty;

  const settingsRef = useRef(resolvedSettings);
  settingsRef.current = resolvedSettings;

  const keyboardInputRef = useKeyboardInput({
    onSpace: () => {
      const prev = stateRef.current;
      const next = handleSpacePressed(prev, settingsRef.current);
      stateRef.current = next;

      if (prev.status === 'idle' && next.status === 'playing') {
        matchStartRef.current = new Date();
        matchEndedFiredRef.current = false;
        aiStateRef.current = createAIState(GAME_HEIGHT / 2);
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

      let effectiveInput: Input = { ...keyboardInputRef.current };
      let rightSpeedMultiplier = 1;

      const difficulty = aiDifficultyRef.current;
      if (difficulty && stateRef.current.status === 'playing') {
        const result = updateAI(stateRef.current, aiStateRef.current, difficulty, now);
        aiStateRef.current = result.nextAIState;
        effectiveInput.rightUp = result.input.rightUp;
        effectiveInput.rightDown = result.input.rightDown;
        rightSpeedMultiplier = result.speedMultiplier;
      }

      const prev = stateRef.current;
      const next = updateGame(
        prev, effectiveInput, dt, settingsRef.current, now, rightSpeedMultiplier,
      );
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

      render(ctx, next, settingsRef.current.theme, aliasesRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [canvasRef, keyboardInputRef]);
}