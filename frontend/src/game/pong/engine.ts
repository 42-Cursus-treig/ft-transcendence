import {
  GAME_WIDTH, GAME_HEIGHT,
  PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
  BALL_SIZE, BALL_INITIAL_SPEED,
} from './constants';
import type { GameState } from './types';

export function createInitialState(): GameState {
  return {
    leftPaddle: {
      x: PADDLE_MARGIN,
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    rightPaddle: {
      x: GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    ball: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      size: BALL_SIZE,
      vx: 0,
      vy: 0,
      speed: BALL_INITIAL_SPEED,
    },
    score: { left: 0, right: 0 },
    status: 'idle',
    winner: null,
  };
}