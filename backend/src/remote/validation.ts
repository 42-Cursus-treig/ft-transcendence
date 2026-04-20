import { z } from 'zod';
import type { GameSettings } from '../game/pong/settings.js';

export const gameSettingsSchema = z.object({
  ballSpeed: z.enum(['SLOW', 'NORMAL', 'FAST']),
  scoreToWin: z.union([z.literal(3), z.literal(5), z.literal(7)]),
  paddleSize: z.enum(['SMALL', 'NORMAL', 'LARGE']),
  theme: z.enum(['CLASSIC', 'SYNTHWAVE', 'MONO']),
  powerUpsEnabled: z.boolean(),
}) satisfies z.ZodType<GameSettings>;

export const createMatchSchema = z.object({
  settings: gameSettingsSchema,
});