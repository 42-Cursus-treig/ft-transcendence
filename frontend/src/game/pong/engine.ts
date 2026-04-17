import {
  GAME_WIDTH, GAME_HEIGHT,
  PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_SPEED,
  BALL_SIZE, BALL_INITIAL_SPEED,
} from './constants';
import type { GameState, Input } from './types';

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

export function updatePaddle(
  currentY: number, 
  up: boolean, 
  down: boolean, 
  dt: number
): number {
  let newY = currentY;
  if (up) newY -= PADDLE_SPEED * dt;
  if (down) newY += PADDLE_SPEED * dt;

  const minY = 0;
  const maxY = GAME_HEIGHT - PADDLE_HEIGHT;
  if (newY < minY) newY = minY;
  if (newY > maxY) newY = maxY;

  return newY;
}

export function updateGame(state: GameState, input: Input, dt: number): GameState {
  if (state.status !== 'playing') return state;

  return {
    ...state,
    leftPaddle: {
      ...state.leftPaddle,
      y: updatePaddle(state.leftPaddle.y, input.leftUp, input.leftDown, dt),
    },
    rightPaddle: {
      ...state.rightPaddle,
      y: updatePaddle(state.rightPaddle.y, input.rightUp, input.rightDown, dt),
    },
  };
}

export function handleSpacePressed(state: GameState): GameState {
  switch (state.status) {
    case 'idle':
      return { ...state, status: 'playing' };
    case 'playing':
      return { ...state, status: 'paused' };
    case 'paused':
      return { ...state, status: 'playing' };
    case 'finished':
      return createInitialState();
    default:
      return state;
  }
}