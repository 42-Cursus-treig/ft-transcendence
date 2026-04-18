import type { FastifyPluginAsync } from 'fastify';
import argon2 from 'argon2';
import { registerSchema, loginSchema } from '../utils/validation.js';
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
} from '../utils/session.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, username, password } = parsed.data;

    const existing = await app.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existing) {
      return reply.code(409).send({ error: 'Email or username already in use' });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    const user = await app.prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    return reply.code(201).send({ user });
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;
    const user = await app.prisma.user.findUnique({ where: { email } });

    const genericError = { error: 'Invalid email or password' };

    if (!user || !user.passwordHash) {
      await argon2.verify(
        '$argon2id$v=19$m=65536,t=3,p=4$abcdefghijklmnop$' +
        'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqr',
        password
      ).catch(() => false);
      return reply.code(401).send(genericError);
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return reply.code(401).send(genericError);
    }

    const token = generateSessionToken();
    const session = await app.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: getSessionExpiry(),
      },
    });

    reply.setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      expires: session.expiresAt,
    });

    reply.setCookie('has_session', '1', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      path: '/',
      expires: session.expiresAt,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    });
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (token) {
      await app.prisma.session
        .deleteMany({ where: { tokenHash: hashSessionToken(token) } })
        .catch(() => undefined);
    }
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    reply.clearCookie('has_session', { path: '/' });
    return reply.send({ success: true });
  });

  app.get(
    '/auth/me',
    { preHandler: [app.requireAuth] },
    async (request) => {
      const fullUser = await app.prisma.user.findUnique({
        where: { id: request.user!.id },
        select: { id: true, email: true, username: true, avatarUrl: true },
      });
      return { user: fullUser };
    },
  );
};