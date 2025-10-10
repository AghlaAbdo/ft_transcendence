import { createServer, IncomingMessage, ServerResponse } from 'http';
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { initializeGameBrokerHandlers } from './socket/manager';
import { initializeDb, getDb } from './database/db';
import apiRouter from './api/router';

const PORT = 4000;

const httpServer = createServer();

const serverFactory = (
  handler: (req: IncomingMessage, res: ServerResponse) => void,
) => {
  httpServer.on('request', handler);
  return httpServer;
};

const fastify: FastifyInstance = Fastify({
  serverFactory: serverFactory,
});

initializeGameBrokerHandlers();

fastify.addHook('onReady', () => {
  initializeDb();
  fastify.decorate('db', getDb());
});

fastify.register(apiRouter, { prefix: '/api' });

fastify.get('/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
