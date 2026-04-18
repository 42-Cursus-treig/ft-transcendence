import { GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT } from './constants';
import type { GameState, Input } from './types';

export type AIDifficulty = 'EASY' | 'NORMAL' | 'HARD';

const DIFFICULTY_PRESETS: Record<AIDifficulty, {
  predictionError: number;
  reactionDelay: number;
  hesitationChance: number;
  hesitationDuration: number;
  deadZone: number;
}> = {
  EASY: { predictionError: 100, reactionDelay: 0.30, hesitationChance: 0.30, hesitationDuration: 0.6, deadZone: 25 },
  NORMAL: { predictionError: 45,  reactionDelay: 0.18, hesitationChance: 0.12, hesitationDuration: 0.3, deadZone: 12 },
  HARD: { predictionError: 10,  reactionDelay: 0.05, hesitationChance: 0.04, hesitationDuration: 0.15, deadZone: 4 },
};

export type AIState = {
  targetY: number;
  lastObservedAt: number;
  reactionTimer: number;
  hesitating: boolean;
  hesitationTimer: number;
};

export function createAIState(initialY: number): AIState {
  return {
    targetY: initialY,
    lastObservedAt: -Infinity,
    reactionTimer: 0,
    hesitating: false,
    hesitationTimer: 0,
  };
}

function predictBallY(
  ballX: number,
  ballY: number,
  ballVx: number,
  ballVy: number,
  targetX: number,
): number | null {
  if (ballVx === 0) return null;
  if ((targetX > ballX && ballVx < 0) || (targetX < ballX && ballVx > 0)) {
    return null;
  }

  const t = (targetX - ballX) / ballVx;
  if (t <= 0) return null;

  const rawY = ballY + ballVy * t;

  const range = GAME_HEIGHT;
  const doubled = range * 2;
  const modded = ((rawY % doubled) + doubled) % doubled;
  const finalY = modded < range ? modded : doubled - modded;

  return finalY;
}

function gaussianNoise(stdDev: number): number {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev;
}

export function updateAI(
  state: GameState,
  aiState: AIState,
  difficulty: AIDifficulty,
  now: number,
): { nextAIState: AIState; input: Pick<Input, 'rightUp' | 'rightDown'> } {
  const preset = DIFFICULTY_PRESETS[difficulty];
  let next = { ...aiState };

  const elapsedSinceObservation = (now - aiState.lastObservedAt) / 1000;
  if (elapsedSinceObservation >= 1.0) {
    next.lastObservedAt = now;
    next.reactionTimer = preset.reactionDelay;

    if (Math.random() < preset.hesitationChance) {
      next.hesitating = true;
      next.hesitationTimer = preset.hesitationDuration;
    }

    const predicted = predictBallY(
      state.ball.x,
      state.ball.y,
      state.ball.vx,
      state.ball.vy,
      state.rightPaddle.x,
    );

    if (predicted !== null) {
      const noisy = predicted + gaussianNoise(preset.predictionError);
      next.targetY = noisy - PADDLE_HEIGHT / 2;
    } else {
      next.targetY = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    }

    next.targetY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, next.targetY));
  }

  if (next.reactionTimer > 0) {
    next.reactionTimer = Math.max(0, next.reactionTimer - 1 / 60);
    return { nextAIState: next, input: { rightUp: false, rightDown: false } };
  }

  if (next.hesitating) {
    next.hesitationTimer = Math.max(0, next.hesitationTimer - 1 / 60);
    if (next.hesitationTimer <= 0) {
      next.hesitating = false;
    }
  }

  const currentCenter = state.rightPaddle.y + PADDLE_HEIGHT / 2;
  const targetCenter = next.targetY + PADDLE_HEIGHT / 2;
  let diff = targetCenter - currentCenter;

  if (next.hesitating) {
    const ballApproaching = state.ball.vx > 0 && state.rightPaddle.x - state.ball.x < GAME_WIDTH * 0.3;
    if (ballApproaching) {
      next.hesitating = false;
      next.hesitationTimer = 0;
    } else {
      diff = -diff * 0.5;
    }
  }

  if (Math.abs(diff) < preset.deadZone) {
    return { nextAIState: next, input: { rightUp: false, rightDown: false } };
  }

  return {
    nextAIState: next,
    input: {
      rightUp: diff < 0,
      rightDown: diff > 0,
    },
  };
}