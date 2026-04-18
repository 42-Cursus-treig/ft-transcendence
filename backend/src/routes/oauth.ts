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
  // ---- GET /api/auth/oauth/42/start ----
  // Démarre le flow : pose un cookie 'state', redirige vers 42
  app.get('/auth/oauth/42/start', async (_request, reply) => {
    const { url, state } = buildAuthorizeUrl();

    reply.setCookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax', // 'lax' car on va être renvoyé ici depuis un site externe
      path: '/',
      maxAge: 60 * 10, // 10 minutes max pour compléter le flow
    });

    return reply.redirect(url);
  });

  // ---- GET /api/auth/oauth/42/callback ----
  // Reçoit le code + state, échange contre un token, récupère le profil,
  // crée/retrouve l'utilisateur local, pose le cookie de session, redirige.
  app.get('/auth/oauth/42/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string };

    // L'utilisateur a refusé l'autorisation sur 42
    if (query.error) {
      return reply.redirect('/login?oauth_error=denied');
    }

    const code = query.code;
    const receivedState = query.state;
    const expectedState = request.cookies[OAUTH_STATE_COOKIE];

    // Sanity checks
    if (!code || !receivedState || !expectedState || receivedState !== expectedState) {
      reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });
      return reply.redirect('/login?oauth_error=state_mismatch');
    }

    // Cookie state consommé
    reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    try {
      const accessToken = await exchangeCodeForToken(code);
      const profile = await fetchProfile(accessToken);

      // Cherche s'il existe déjà un OAuthAccount pour cette identité 42
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
        // L'utilisateur s'est déjà connecté via 42 → on réutilise son compte
        userId = existingOAuth.userId;

        // Optionnel : mettre à jour l'avatar au cas où il aurait changé
        if (profile.avatarUrl && existingOAuth.user.avatarUrl !== profile.avatarUrl) {
          await app.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: profile.avatarUrl },
          });
        }
      } else {
        // Première connexion 42 : créer un user local
        // Le username 42 est unique, mais il peut déjà exister localement
        // (ex: un user s'est inscrit manuellement avec le même login).
        // On génère un username unique si besoin.
        let username = profile.login;
        let attempt = 0;
        while (
          await app.prisma.user.findUnique({ where: { username } })
        ) {
          attempt++;
          username = `${profile.login}-${attempt}`;
          if (attempt > 10) throw new Error('Username collision exhausted');
        }

        // L'email 42 pourrait déjà être utilisé localement — on le gère :
        // si oui, on lie l'OAuthAccount au user existant au lieu d'en créer un nouveau.
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

      // Créer une session locale comme pour un login classique
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

      return reply.redirect('/');
    } catch (err) {
      app.log.error({ err }, 'OAuth 42 callback failed');
      return reply.redirect('/login?oauth_error=server_error');
    }
  });
};