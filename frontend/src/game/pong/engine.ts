import {
  GAME_WIDTH, GAME_HEIGHT,
  PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_SPEED,
  BALL_SIZE, BALL_INITIAL_SPEED, BALL_SPEED_INCREMENT, BALL_MAX_SPEED,
  SCORE_TO_WIN,
} from './constants';
import type { GameState, Input, Side } from './types';

function serveBall(directionX: -1 | 1 = Math.random() < 0.5 ? -1 : 1): { vx: number; vy: number } {
  const angle = (Math.random() - 0.5) * (Math.PI / 2);
  const speed = BALL_INITIAL_SPEED;
  return {
    vx: Math.cos(angle) * speed * directionX,
    vy: Math.sin(angle) * speed,
  };
}

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

  const leftY = updatePaddle(state.leftPaddle.y, input.leftUp, input.leftDown, dt);
  const rightY = updatePaddle(state.rightPaddle.y, input.rightUp, input.rightDown, dt);

  const intermediate: GameState = {
    ...state,
    leftPaddle: { ...state.leftPaddle, y: leftY },
    rightPaddle: { ...state.rightPaddle, y: rightY },
  };

  const { ball, scoredBy } = updateBall(intermediate, dt);

  if (scoredBy) {
    const newScore = {
      ...state.score,
      [scoredBy]: state.score[scoredBy] + 1,
    };

    if (newScore[scoredBy] >= SCORE_TO_WIN) {
      return {
        ...intermediate,
        ball,
        score: newScore,
        status: 'finished',
        winner: scoredBy,
      };
    }

    const newDirection: -1 | 1 = scoredBy === 'left' ? -1 : 1;
    return {
      ...intermediate,
      ball: resetBall(newDirection),
      score: newScore,
    };
  }

  return { ...intermediate, ball };
}

export function handleSpacePressed(state: GameState): GameState {
  switch (state.status) {
    case 'idle': {
      const { vx, vy } = serveBall();
      return {
        ...state,
        status: 'playing',
        ball: { ...state.ball, vx, vy },
      };
    }
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

function updateBall(state: GameState, dt: number): {
  ball: GameState['ball'];
  scoredBy: Side | null;
} {
  let { x, y, vx, vy, speed, size } = state.ball;
  const halfSize = size / 2;

  x += vx * dt;
  y += vy * dt;

  if (y - halfSize < 0) {
    y = halfSize;
    vy = Math.abs(vy);
  } else if (y + halfSize > GAME_HEIGHT) {
    y = GAME_HEIGHT - halfSize;
    vy = -Math.abs(vy);
  }

  const left = state.leftPaddle;
  if (
    vx < 0 &&
    x - halfSize <= left.x + left.width &&
    x - halfSize >= left.x &&
    y + halfSize >= left.y &&
    y - halfSize <= left.y + left.height
  ) {
    const hitOffset = (y - (left.y + left.height / 2)) / (left.height / 2);
    const bounceAngle = hitOffset * (Math.PI / 3);

    speed = Math.min(speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    vx = Math.cos(bounceAngle) * speed;
    vy = Math.sin(bounceAngle) * speed;

    x = left.x + left.width + halfSize;
  }

  const right = state.rightPaddle;
  if (
    vx > 0 &&
    x + halfSize >= right.x &&
    x + halfSize <= right.x + right.width &&
    y + halfSize >= right.y &&
    y - halfSize <= right.y + right.height
  ) {
    const hitOffset = (y - (right.y + right.height / 2)) / (right.height / 2);
    const bounceAngle = hitOffset * (Math.PI / 3);

    speed = Math.min(speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    vx = -Math.cos(bounceAngle) * speed;
    vy = Math.sin(bounceAngle) * speed;

    x = right.x - halfSize;
  }

  let scoredBy: Side | null = null;
  if (x + halfSize < 0) {
    scoredBy = 'right';
  } else if (x - halfSize > GAME_WIDTH) {
    scoredBy = 'left';
  }

  return {
    ball: { x, y, vx, vy, speed, size },
    scoredBy,
  };
}

function resetBall(directionX: -1 | 1): GameState['ball'] {
  const { vx, vy } = serveBall(directionX);
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx,
    vy,
    speed: BALL_INITIAL_SPEED,
    size: BALL_SIZE,
  };
}