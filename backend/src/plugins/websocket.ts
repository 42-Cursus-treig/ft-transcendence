import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import websocket from '@fastify/websocket';

const websocketPlugin: FastifyPluginAsync = async (app) => {
  await app.register(websocket, {
    options: {
      maxPayload: 4 * 1024,
    },
  });
};

export default fp(websocketPlugin, { name: 'websocket' });