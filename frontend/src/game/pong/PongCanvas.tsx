import { useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { usePongGame } from './usePongGame';

export function PongCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePongGame(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="block mx-auto border-2 border-accent max-w-full"
      style={{
        aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        width: '100%',
        maxWidth: `${GAME_WIDTH}px`,
        maxHeight: '60vh',
        imageRendering: 'pixelated',
        boxShadow: '0 0 20px rgba(57, 255, 20, 0.4), inset 0 0 30px rgba(57, 255, 20, 0.1)',
      }}
    />
  );
}