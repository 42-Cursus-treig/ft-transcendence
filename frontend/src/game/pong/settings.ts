import { PADDLE_WIDTH, PADDLE_MARGIN, GAME_WIDTH, GAME_HEIGHT } from "./constants";

export type Theme = 'CLASSIC' | 'SYNTHWAVE' | 'MONO';

export type GameSettings = {
    ballSpeed: 'SLOW' | 'NORMAL' | 'FAST';
    scoreToWin: 3 | 5 | 7;
    paddleSize: 'SMALL' | 'NORMAL' | 'LARGE';
    theme: Theme;
    powerUpsEnabled: boolean;
};

export type ResolvedSettings = {
    ballInitialSpeed: number;
    ballSpeedIncrement: number;
    ballMaxSpeed: number;
    paddleHeight: number;
    scoreToWin: number;
    theme: Theme;
    powerUpsEnabled: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
    ballSpeed: "NORMAL",
    scoreToWin: 5,
    paddleSize: "NORMAL",
    theme: "CLASSIC",
    powerUpsEnabled: false,
};

export const BALL_SPEED_PRESETS: Record<GameSettings['ballSpeed'], {
  initial: number;
  increment: number;
  max: number;
}> = {
  SLOW:   { initial: 280, increment: 20, max: 600 },
  NORMAL: { initial: 400, increment: 30, max: 900 },
  FAST:   { initial: 600, increment: 40, max: 1200 },
};

export const PADDLE_HEIGHT_PRESETS: Record<GameSettings['paddleSize'], number> = {
    SMALL: 60,
    NORMAL: 90,
    LARGE: 130,
}

export function resolveSettings(s: GameSettings): ResolvedSettings {
  const ball = BALL_SPEED_PRESETS[s.ballSpeed];
  return {
    ballInitialSpeed: ball.initial,
    ballSpeedIncrement: ball.increment,
    ballMaxSpeed: ball.max,
    paddleHeight: PADDLE_HEIGHT_PRESETS[s.paddleSize],
    scoreToWin: s.scoreToWin,
    theme: s.theme,
    powerUpsEnabled: s.powerUpsEnabled,
  };
}