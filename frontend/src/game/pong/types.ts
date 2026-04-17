export type Side = 'left' | 'right';

export type Paddle = {
    x: number;
    y: number;
    width: number;
    height: number;
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

export type GameState = {
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    ball: Ball;
    score: Score;
    status: GameStatus;
    winner: Side | null;
};

export type Input = {
  leftUp: boolean;
  leftDown: boolean;
  rightUp: boolean;
  rightDown: boolean;
};