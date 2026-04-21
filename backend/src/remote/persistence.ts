import type { PrismaClient } from '@prisma/client';
import type { RemoteMatch } from './types.js';

export async function persistRemoteMatch(
  prisma: PrismaClient,
  match: RemoteMatch,
  winnerSide: 'LEFT' | 'RIGHT',
): Promise<void> {
  if (!match.guest) {
    return;
  }
  if (!match.startedAt || !match.endedAt) {
    return;
  }

  const leftScore = match.gameState.score.left;
  const rightScore = match.gameState.score.right;

  try {
    await prisma.match.create({
      data: {
        mode: 'REMOTE_1V1',
        winnerSide,
        startedAt: new Date(match.startedAt),
        endedAt: new Date(match.endedAt),
        durationMs: match.endedAt - match.startedAt,
        participants: {
          create: [
            {
              alias: match.host.username,
              side: 'LEFT',
              score: leftScore,
              userId: match.host.userId,
              isGuest: false,
            },
            {
              alias: match.guest.username,
              side: 'RIGHT',
              score: rightScore,
              userId: match.guest.userId,
              isGuest: false,
            },
          ],
        },
      },
    });
  } catch (err) {
    console.error('[persistence] Failed to save remote match:', err);
  }
}