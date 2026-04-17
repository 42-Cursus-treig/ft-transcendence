import { useEffect, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { createInitialState } from './engine';
import { render } from './renderer';

export function usePongGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const stateRef = useRef(createInitialState());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx, stateRef.current);
  }, [canvasRef]);
}