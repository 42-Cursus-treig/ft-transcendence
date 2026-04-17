import { useEffect, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { createInitialState, updateGame, handleSpacePressed } from './engine';
import { render } from './renderer';
import { useKeyboardInput } from './useKeyboardInput';

export function usePongGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const stateRef = useRef(createInitialState());

  const inputRef = useKeyboardInput({
    onSpace: () => {
      stateRef.current = handleSpacePressed(stateRef.current);
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

      stateRef.current = updateGame(stateRef.current, inputRef.current, dt);
      render(ctx, stateRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, inputRef]);
}