import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          api: 'up',
          database: 'up',
        },
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          api: 'up',
          database: 'down',
        },
      };
    }
  });
};