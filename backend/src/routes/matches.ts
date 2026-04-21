import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const participantSchema = z.object({
  alias: z.string().min(1).max(30),
  side: z.enum(['LEFT', 'RIGHT']),
  score: z.number().int().min(0).max(50),
  isCurrentUser: z.boolean(),
});

const createMatchSchema = z.object({
  mode: z.enum(['LOCAL', 'AI', 'REMOTE_1V1', 'TOURNAMENT']),
  winnerSide: z.enum(['LEFT', 'RIGHT']),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  participants: z.array(participantSchema).length(2),
});

export const matchRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/matches',
    { preHandler: [app.requireAuth] },
    async (request, reply) => {
      const parsed = createMatchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const user = request.user!;
      const data = parsed.data;

      const started = new Date(data.startedAt);
      const ended = new Date(data.endedAt);
      if (ended <= started) {
        return reply.code(400).send({ error: 'endedAt must be after startedAt' });
      }
      const durationMs = ended.getTime() - started.getTime();
      if (durationMs > 1000 * 60 * 60 * 2) {
        return reply.code(400).send({ error: 'Match duration is unrealistic' });
      }

      const winner = data.participants.find((p) => p.side === data.winnerSide);
      const loser = data.participants.find((p) => p.side !== data.winnerSide);
      if (!winner || !loser || winner.score <= loser.score) {
        return reply.code(400).send({ error: 'Winner score inconsistent' });
      }

      const currentUserCount = data.participants.filter((p) => p.isCurrentUser).length;
      if (currentUserCount !== 1) {
        return reply.code(400).send({
          error: 'Exactly one participant must be flagged as the current user',
        });
      }

      const match = await app.prisma.match.create({
        data: {
          mode: data.mode,
          winnerSide: data.winnerSide,
          startedAt: started,
          endedAt: ended,
          durationMs,
          participants: {
            create: data.participants.map((p) => ({
              alias: p.alias,
              side: p.side,
              score: p.score,
              userId: p.isCurrentUser ? user.id : null,
              isGuest: !p.isCurrentUser,
            })),
          },
        },
        include: { participants: true },
      });

      return reply.code(201).send({ match });
    },
  );

  app.get(
    '/matches/me',
    { preHandler: [app.requireAuth] },
    async (request) => {
      const user = request.user!;

      const query = request.query as { page?: string; pageSize?: string };
      const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? '10', 10) || 10));
      const skip = (page - 1) * pageSize;

      const where = {
        participants: { some: { userId: user.id } },
      };

      const [total, matches] = await Promise.all([
        app.prisma.match.count({ where }),
        app.prisma.match.findMany({
          where,
          include: {
            participants: {
              select: {
                alias: true,
                side: true,
                score: true,
                userId: true,
                isGuest: true,
              },
            },
          },
          orderBy: { endedAt: 'desc' },
          skip,
          take: pageSize,
        }),
      ]);

      return {
        matches,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: page * pageSize < total,
        },
      };
    },
  );
};