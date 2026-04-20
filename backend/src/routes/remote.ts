import type { FastifyPluginAsync } from 'fastify';
import type { RawData } from 'ws';
import {
  SESSION_COOKIE_NAME,
  hashSessionToken,
  isSessionExpired,
} from '../utils/session.js';
import { remoteRegistry } from '../remote/registry.js';
import { createMatchSchema } from '../remote/validation.js';
import {
  startMatch,
  handlePlayerDisconnect,
  handlePlayerReconnect,
} from '../remote/gameLoop.js';

export const remoteRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/remote/matches',
    { preHandler: [app.requireAuth] },
    async (request, reply) => {
      const user = request.user!;

      const existing = remoteRegistry.findActiveForUser(user.id);
      if (existing) {
        return reply.code(409).send({
          error: 'You are already in an active match',
          matchId: existing.id,
        });
      }

      const parsed = createMatchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid settings',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const match = remoteRegistry.create(
        {
          userId: user.id,
          username: user.username,
          socket: null,
          input: { up: false, down: false }
        },
        parsed.data.settings,
      );

      return reply.code(201).send({
        match: {
          id: match.id,
          status: match.status,
          settings: match.settings,
          host: { username: match.host.username },
          guest: null,
        },
      });
    },
  );

  app.get(
    '/remote/matches',
    { preHandler: [app.requireAuth] },
    async () => {
      return { matches: remoteRegistry.listWaiting() };
    },
  );

  app.get<{ Params: { id: string } }>(
    '/remote/matches/:id',
    { preHandler: [app.requireAuth] },
    async (request, reply) => {
      const match = remoteRegistry.get(request.params.id);
      if (!match) {
        return reply.code(404).send({ error: 'Match not found' });
      }
      const user = request.user!;

      const isParticipant =
        match.host.userId === user.id || match.guest?.userId === user.id;

      return {
        match: {
          id: match.id,
          status: match.status,
          settings: match.settings,
          host: { username: match.host.username },
          guest: match.guest ? { username: match.guest.username } : null,
          isParticipant,
        },
      };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/remote/matches/:id/join',
    { preHandler: [app.requireAuth] },
    async (request, reply) => {
      const user = request.user!;
      const match = remoteRegistry.get(request.params.id);

      if (!match) {
        return reply.code(404).send({ error: 'Match not found' });
      }

      if (match.host.userId === user.id) {
        return reply.code(400).send({ error: 'You are already the host of this match' });
      }
      if (match.status !== 'WAITING') {
        return reply.code(409).send({ error: 'Match is not joinable' });
      }
      if (match.guest) {
        return reply.code(409).send({ error: 'Match is already full' });
      }

      const existing = remoteRegistry.findActiveForUser(user.id);
      if (existing) {
        return reply.code(409).send({
          error: 'You are already in an active match',
          matchId: existing.id,
        });
      }

      match.guest = {
        userId: user.id,
        username: user.username,
        socket: null,
        disconnectedAt: null,
        ready: false,
        input: { up: false, down: false },
      };

      return {
        match: {
          id: match.id,
          status: match.status,
          settings: match.settings,
          host: { username: match.host.username },
          guest: { username: match.guest.username },
        },
      };
    },
  );

  app.get('/remote/ws', { websocket: true }, async (socket, request) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) {
      socket.send(JSON.stringify({ type: 'error', message: 'No session cookie' }));
      socket.close(4001, 'Unauthenticated');
      return;
    }

    const session = await app.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: true },
    });

    if (!session || isSessionExpired(session.expiresAt)) {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid session' }));
      socket.close(4001, 'Unauthenticated');
      return;
    }

    const user = session.user;
    app.log.info(`WS connected: ${user.username}`);

    socket.send(JSON.stringify({
      type: 'welcome',
      user: { id: user.id, username: user.username },
    }));

    let attachedMatchId: string | null = null;
    let attachedSide: 'LEFT' | 'RIGHT' | null = null;

    socket.on('message', (raw: RawData) => {
      let msg: { type: string; [key: string]: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
      }

      if (msg.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (msg.type === 'attach') {
        const matchId = typeof msg.matchId === 'string' ? msg.matchId : null;
        if (!matchId) {
          socket.send(JSON.stringify({ type: 'error', message: 'Missing matchId' }));
          return;
        }

        const match = remoteRegistry.get(matchId);
        if (!match) {
          socket.send(JSON.stringify({ type: 'error', message: 'Match not found' }));
          return;
        }

        let side: 'LEFT' | 'RIGHT';
        if (match.host.userId === user.id) {
          side = 'LEFT';
          match.host.socket = socket;
          match.host.disconnectedAt = null;
        } else if (match.guest?.userId === user.id) {
          side = 'RIGHT';
          match.guest.socket = socket;
          match.guest.disconnectedAt = null;
        } else {
          socket.send(JSON.stringify({ type: 'error', message: 'Not a participant of this match' }));
          return;
        }

        attachedMatchId = matchId;
        attachedSide = side;

        socket.send(JSON.stringify({
          type: 'attached',
          side,
          match: {
            id: match.id,
            status: match.status,
            settings: match.settings,
            host: { username: match.host.username },
            guest: match.guest ? { username: match.guest.username } : null,
          },
        }));

        // Notifie l'autre joueur avec un snapshot complet du match
        const otherSide = attachedSide === 'LEFT' ? 'RIGHT' : 'LEFT';
        const otherPlayer = otherSide === 'LEFT' ? match.host : match.guest;

        if (otherPlayer?.socket) {
          // L'autre joueur est connecté : on lui envoie la mise à jour
          remoteRegistry.sendToPlayer(match, otherSide, {
            type: 'opponent_joined',
            match: {
              id: match.id,
              status: match.status,
              settings: match.settings,
              host: { username: match.host.username },
              guest: match.guest ? { username: match.guest.username } : null,
            },
          });
          // Et on gère la reprise de partie si c'était une déconnexion en cours
          handlePlayerReconnect(match);
        }

        app.log.info(`WS attached: ${user.username} → match ${matchId} as ${side}`);
        return;
      }

      if (!attachedMatchId || !attachedSide) {
        socket.send(JSON.stringify({ type: 'error', message: 'Not attached to a match' }));
        return;
      }

      const match = remoteRegistry.get(attachedMatchId);
      if (!match) {
        socket.send(JSON.stringify({ type: 'aborted', reason: 'match_gone' }));
        socket.close();
        return;
      }

      if (msg.type === 'ready') {
        const player = attachedSide === 'LEFT' ? match.host : match.guest;
        if (!player) return;
        player.ready = true;

        // Accusé de réception pour l'émetteur
        socket.send(JSON.stringify({ type: 'ready_ack' }));

        if (
          match.host.ready &&
          match.guest?.ready &&
          match.host.socket &&
          match.guest.socket
        ) {
          match.status = 'READY';
          startMatch(match);
        } else {
          const otherSide = attachedSide === 'LEFT' ? 'RIGHT' : 'LEFT';
          remoteRegistry.sendToPlayer(match, otherSide, { type: 'opponent_ready' });
        }
        return;
      }

      if (msg.type === 'input') {
        const up = msg.up === true;
        const down = msg.down === true;

        const player = attachedSide === 'LEFT' ? match.host : match.guest;
        if (!player) return;

        if (match.status !== 'PLAYING') return;

        player.input = { up, down };
        return;
      }

      socket.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msg.type}` }));
    });

    socket.on('close', (code: number, reason: Buffer) => {
      app.log.info(`WS disconnected: ${user.username} (${code}: ${reason.toString()})`);

      if (attachedMatchId && attachedSide) {
        const match = remoteRegistry.get(attachedMatchId);
        if (match) {
          const player = attachedSide === 'LEFT' ? match.host : match.guest;
          if (player) {
            player.socket = null;
            player.disconnectedAt = Date.now();
          }
          const otherSide = attachedSide === 'LEFT' ? 'RIGHT' : 'LEFT';
          remoteRegistry.sendToPlayer(match, otherSide, {
            type: 'opponent_disconnected',
          });

          handlePlayerDisconnect(match, attachedSide);
        }
      }
    });

    socket.on('error', (err: Error) => {
      app.log.error({ err }, `WS error for ${user.username}`);
    });
  });
};