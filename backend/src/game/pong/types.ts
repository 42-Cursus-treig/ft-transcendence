export type Side = 'left' | 'right';

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
  baseHeight: number;
};

export type Ball = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  speed: number;
};

export type Score = {
  left: number;
  right: number;
};

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type PowerUpType = 'BIG_PADDLE' | 'SMALL_PADDLE' | 'INVERT_CONTROLS';

export type PowerUp = {
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
};

export type ActivePowerUp = {
  type: PowerUpType;
  side: Side;
  expiresAt: number;
};

export type GameState = {
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  score: Score;
  status: GameStatus;
  winner: Side | null;
  powerUp: PowerUp | null;
  activePowerUps: ActivePowerUp[];
  lastPowerUpSpawnAt: number;
};

export type Input = {
  leftUp: boolean;
  leftDown: boolean;
  rightUp: boolean;
  rightDown: boolean;
};