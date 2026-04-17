import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { SESSION_COOKIE_NAME, hashSessionToken, isSessionExpired } from '../utils/session.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      username: string;
    };
  }
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (request) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) return;

    const session = await app.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: true },
    });

    if (!session || isSessionExpired(session.expiresAt)) {
      return;
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
    };
  });

  app.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};

export default fp(authPlugin, { name: 'auth' });