import type { FastifyPluginAsync } from 'fastify';
import { buildAuthorizeUrl, exchangeCodeForToken, fetchProfile } from '../oauth/42.js';
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
} from '../utils/session.js';

const OAUTH_STATE_COOKIE = 'oauth_42_state';

export const oauthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/auth/oauth/42/start', async (_request, reply) => {
    const { url, state } = buildAuthorizeUrl();

    reply.setCookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    });

    return reply.redirect(url);
  });

  app.get('/auth/oauth/42/callback', async (request, reply) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${frontendUrl}/login?oauth_error=denied`);
    }

    const code = query.code;
    const receivedState = query.state;
    const expectedState = request.cookies[OAUTH_STATE_COOKIE];

    if (!code || !receivedState || !expectedState || receivedState !== expectedState) {
      reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });
      return reply.redirect(`${frontendUrl}/login?oauth_error=state_mismatch`);
    }

    reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    try {
      const accessToken = await exchangeCodeForToken(code);
      const profile = await fetchProfile(accessToken);

      const existingOAuth = await app.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: '42',
            providerUserId: String(profile.id),
          },
        },
        include: { user: true },
      });

      let userId: string;

      if (existingOAuth) {
        userId = existingOAuth.userId;

        if (profile.avatarUrl && existingOAuth.user.avatarUrl !== profile.avatarUrl) {
          await app.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: profile.avatarUrl },
          });
        }
      } else {
        let username = profile.login;
        let attempt = 0;
        while (
          await app.prisma.user.findUnique({ where: { username } })
        ) {
          attempt++;
          username = `${profile.login}-${attempt}`;
          if (attempt > 10) throw new Error('Username collision exhausted');
        }

        const byEmail = await app.prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (byEmail) {
          userId = byEmail.id;
          await app.prisma.oAuthAccount.create({
            data: {
              userId,
              provider: '42',
              providerUserId: String(profile.id),
            },
          });
          if (profile.avatarUrl && !byEmail.avatarUrl) {
            await app.prisma.user.update({
              where: { id: userId },
              data: { avatarUrl: profile.avatarUrl },
            });
          }
        } else {
          const created = await app.prisma.user.create({
            data: {
              email: profile.email,
              username,
              passwordHash: null,
              avatarUrl: profile.avatarUrl,
              oauthAccounts: {
                create: {
                  provider: '42',
                  providerUserId: String(profile.id),
                },
              },
            },
          });
          userId = created.id;
        }
      }

      const token = generateSessionToken();
      const session = await app.prisma.session.create({
        data: {
          userId,
          tokenHash: hashSessionToken(token),
          expiresAt: getSessionExpiry(),
        },
      });

      reply.setCookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        expires: session.expiresAt,
      });
      reply.setCookie('has_session', '1', {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
        expires: session.expiresAt,
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return reply.type('text/html').send(`
        <html>
          <body>
            <script>
              window.location.href = "${frontendUrl}";
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      app.log.error({ err }, 'OAuth 42 callback failed');
      return reply.redirect('/login?oauth_error=server_error');
    }
  });
};