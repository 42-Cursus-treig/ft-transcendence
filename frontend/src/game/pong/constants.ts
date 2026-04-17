// Dimensions du terrain
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Raquettes
export const PADDLE_WIDTH = 12;
export const PADDLE_HEIGHT = 90;
export const PADDLE_MARGIN = 20;
export const PADDLE_SPEED = 500;

// Balle
export const BALL_SIZE = 12;
export const BALL_INITIAL_SPEED = 400;
export const BALL_SPEED_INCREMENT = 30;
export const BALL_MAX_SPEED = 900;

// Règles
export const SCORE_TO_WIN = 5;

// Couleurs
export const COLORS = {
  bg: '#0a0a0f',
  fg: '#39ff14',
  net: '#39ff14',
  text: '#e8e8e8',
  glow: 'rgba(57, 255, 20, 0.6)',
} as const;