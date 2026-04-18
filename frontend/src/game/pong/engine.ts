import {
  GAME_WIDTH, GAME_HEIGHT,
  PADDLE_WIDTH, PADDLE_SPEED, PADDLE_MARGIN,
  BALL_SIZE,
  POWERUP_SIZE, POWERUP_SPAWN_INTERVAL_MS,
  POWERUP_BIG_PADDLE_DURATION_MS, POWERUP_BIG_PADDLE_MULTIPLIER,
  POWERUP_SMALL_PADDLE_DURATION_MS, POWERUP_SMALL_PADDLE_MULTIPLIER,
  POWERUP_INVERT_CONTROLS_DURATION_MS,
} from './constants';
import type { GameState, Input, Side, PowerUp, PowerUpType } from './types';
import type { ResolvedSettings } from './settings';

export function createInitialState(settings: ResolvedSettings): GameState {
  return {
    leftPaddle: {
      x: PADDLE_MARGIN,
      y: GAME_HEIGHT / 2 - settings.paddleHeight / 2,
      width: PADDLE_WIDTH,
      height: settings.paddleHeight,
      baseHeight: settings.paddleHeight,
    },
    rightPaddle: {
      x: GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
      y: GAME_HEIGHT / 2 - settings.paddleHeight / 2,
      width: PADDLE_WIDTH,
      height: settings.paddleHeight,
      baseHeight: settings.paddleHeight,
    },
    ball: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      size: BALL_SIZE,
      vx: 0,
      vy: 0,
      speed: settings.ballInitialSpeed,
    },
    score: { left: 0, right: 0 },
    status: 'idle',
    winner: null,
    powerUp: null,
    activePowerUps: [],
    lastPowerUpSpawnAt: 0,
  };
}

function serveBall(
  initialSpeed: number,
  directionX: -1 | 1 = Math.random() < 0.5 ? -1 : 1,
): { vx: number; vy: number } {
  const angle = (Math.random() - 0.5) * (Math.PI / 2);
  return {
    vx: Math.cos(angle) * initialSpeed * directionX,
    vy: Math.sin(angle) * initialSpeed,
  };
}

export function handleSpacePressed(
  state: GameState,
  settings: ResolvedSettings,
): GameState {
  switch (state.status) {
    case 'idle': {
      const { vx, vy } = serveBall(settings.ballInitialSpeed);
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
      return createInitialState(settings);
    default:
      return state;
  }
}

export function updatePaddle(
  currentY: number,
  up: boolean,
  down: boolean,
  dt: number,
  paddleHeight: number,
  speedMultiplier: number = 1,
): number {
  let newY = currentY;
  const speed = PADDLE_SPEED * speedMultiplier;
  if (up) newY -= speed * dt;
  if (down) newY += speed * dt;

  const minY = 0;
  const maxY = GAME_HEIGHT - paddleHeight;
  if (newY < minY) newY = minY;
  if (newY > maxY) newY = maxY;

  return newY;
}

function updateBall(state: GameState, settings: ResolvedSettings, dt: number): {
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
    speed = Math.min(speed + settings.ballSpeedIncrement, settings.ballMaxSpeed);
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
    speed = Math.min(speed + settings.ballSpeedIncrement, settings.ballMaxSpeed);
    vx = -Math.cos(bounceAngle) * speed;
    vy = Math.sin(bounceAngle) * speed;
    x = right.x - halfSize;
  }

  let scoredBy: Side | null = null;
  if (x + halfSize < 0) scoredBy = 'right';
  else if (x - halfSize > GAME_WIDTH) scoredBy = 'left';

  return { ball: { x, y, vx, vy, speed, size }, scoredBy };
}

function resetBall(
  settings: ResolvedSettings,
  directionX: -1 | 1,
): GameState['ball'] {
  const { vx, vy } = serveBall(settings.ballInitialSpeed, directionX);
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx,
    vy,
    speed: settings.ballInitialSpeed,
    size: BALL_SIZE,
  };
}

const POWERUP_TYPES: PowerUpType[] = ['BIG_PADDLE', 'SMALL_PADDLE', 'INVERT_CONTROLS'];

function maybeSpawnPowerUp(state: GameState, now: number): PowerUp | null {
  if (state.powerUp) return state.powerUp;
  if (now - state.lastPowerUpSpawnAt < POWERUP_SPAWN_INTERVAL_MS) return null;
  if (Math.random() > 0.005) return null;

  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

  return {
    type,
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT * 0.25 + Math.random() * GAME_HEIGHT * 0.5,
    size: POWERUP_SIZE,
  };
}

function checkPowerUpCollision(
  powerUp: PowerUp,
  ballX: number,
  ballY: number,
  ballSize: number,
): boolean {
  const halfBall = ballSize / 2;
  const halfPU = powerUp.size / 2;
  return (
    ballX + halfBall >= powerUp.x - halfPU &&
    ballX - halfBall <= powerUp.x + halfPU &&
    ballY + halfBall >= powerUp.y - halfPU &&
    ballY - halfBall <= powerUp.y + halfPU
  );
}

export function updateGame(
  state: GameState,
  input: Input,
  dt: number,
  settings: ResolvedSettings,
  now: number,
  rightSpeedMultiplier: number = 1,
): GameState {
  if (state.status !== 'playing') return state;

  const activePowerUps = state.activePowerUps.filter((p) => p.expiresAt > now);

  const paddleHeightMultiplier = (side: Side): number => {
    let mult = 1;
    for (const p of activePowerUps) {
      if (p.side !== side) continue;
      if (p.type === 'BIG_PADDLE') mult *= POWERUP_BIG_PADDLE_MULTIPLIER;
      if (p.type === 'SMALL_PADDLE') mult *= POWERUP_SMALL_PADDLE_MULTIPLIER;
    }
    return mult;
  };

  const hasInvertedControls = (side: Side): boolean =>
    activePowerUps.some((p) => p.side === side && p.type === 'INVERT_CONTROLS');

  const leftHeight = state.leftPaddle.baseHeight * paddleHeightMultiplier('left');
  const rightHeight = state.rightPaddle.baseHeight * paddleHeightMultiplier('right');

  const leftUp = hasInvertedControls('left') ? input.leftDown : input.leftUp;
  const leftDown = hasInvertedControls('left') ? input.leftUp : input.leftDown;
  const rightUp = hasInvertedControls('right') ? input.rightDown : input.rightUp;
  const rightDown = hasInvertedControls('right') ? input.rightUp : input.rightDown;

  const leftY = updatePaddle(state.leftPaddle.y, leftUp, leftDown, dt, leftHeight);
  const rightY = updatePaddle(
    state.rightPaddle.y, rightUp, rightDown, dt,
    rightHeight, rightSpeedMultiplier,
  );

  let intermediate: GameState = {
    ...state,
    leftPaddle: { ...state.leftPaddle, y: leftY, height: leftHeight },
    rightPaddle: { ...state.rightPaddle, y: rightY, height: rightHeight },
    activePowerUps,
  };

  const { ball, scoredBy } = updateBall(intermediate, settings, dt);

  let powerUp = state.powerUp;
  let lastSpawnAt = state.lastPowerUpSpawnAt;
  let newActive = activePowerUps;

  if (settings.powerUpsEnabled) {
    if (powerUp && checkPowerUpCollision(powerUp, ball.x, ball.y, ball.size)) {
      const hitter: Side = ball.vx > 0 ? 'left' : 'right';
      const opponent: Side = hitter === 'left' ? 'right' : 'left';

      let affectedSide: Side;
      let durationMs: number;

      switch (powerUp.type) {
        case 'BIG_PADDLE':
          affectedSide = hitter;
          durationMs = POWERUP_BIG_PADDLE_DURATION_MS;
          break;
        case 'SMALL_PADDLE':
          affectedSide = opponent;
          durationMs = POWERUP_SMALL_PADDLE_DURATION_MS;
          break;
        case 'INVERT_CONTROLS':
          affectedSide = opponent;
          durationMs = POWERUP_INVERT_CONTROLS_DURATION_MS;
          break;
      }

      newActive = [
        ...activePowerUps,
        {
          type: powerUp.type,
          side: affectedSide,
          expiresAt: now + durationMs,
        },
      ];
      powerUp = null;
      lastSpawnAt = now;
    } else if (!powerUp) {
      powerUp = maybeSpawnPowerUp(intermediate, now);
      if (powerUp) lastSpawnAt = now;
    }
  } else {
    powerUp = null;
    newActive = [];
  }

  intermediate = {
    ...intermediate,
    powerUp,
    activePowerUps: newActive,
    lastPowerUpSpawnAt: lastSpawnAt,
  };

  if (scoredBy) {
    const newScore = { ...state.score, [scoredBy]: state.score[scoredBy] + 1 };
    if (newScore[scoredBy] >= settings.scoreToWin) {
      return { ...intermediate, ball, score: newScore, status: 'finished', winner: scoredBy };
    }
    const newDirection: -1 | 1 = scoredBy === 'left' ? -1 : 1;
    return {
      ...intermediate,
      ball: resetBall(settings, newDirection),
      score: newScore,
      activePowerUps: [],
      powerUp: null,
    };
  }

  return { ...intermediate, ball };
}