import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { PrismaClient } from '@prisma/client';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { matchRoutes } from './routes/matches.js';
import { oauthRoutes } from './routes/oauth.js';
import authPlugin from './plugins/auth.js';
import websocketPlugin from './plugins/websocket.js';
import { remoteRoutes } from './routes/remote.js';
import { setPrismaForGameLoop } from './remote/gameLoop.js';

const prisma = new PrismaClient();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(cookie, {
  secret: process.env.JWT_SECRET,
});

app.decorate('prisma', prisma);
setPrismaForGameLoop(app.prisma);

await app.register(websocketPlugin);
await app.register(authPlugin);

await app.register(healthRoutes, { prefix: '/api' });
await app.register(authRoutes, { prefix: '/api' });
await app.register(matchRoutes, { prefix: '/api' });
await app.register(oauthRoutes, { prefix: '/api' });
await app.register(remoteRoutes, { prefix: '/api' });

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

try {
  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Server listening on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}