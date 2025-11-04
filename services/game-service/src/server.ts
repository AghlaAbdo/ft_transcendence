import { createServer, IncomingMessage, ServerResponse } from 'http';
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { initializeSocketIO } from './socket/manager';
import { initializeDb, getDb } from './database/db';
import apiRouter from './api/router';
import fs from 'fs';

const logStream = fs.createWriteStream('./logs/game.log', { flags: 'a' });

const PORT = 4000;

const httpServer = createServer();

const serverFactory = (
  handler: (req: IncomingMessage, res: ServerResponse) => void,
) => {
  httpServer.on('request', handler);
  return httpServer;
};

const fastify: FastifyInstance = Fastify({
  serverFactory,
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    stream: logStream,
    base: null,
    timestamp: () => `,"time":"${new Date().toISOString()}"`
  }
});

export function logEvent(level: 'info' | 'warn' | 'error' | 'debug', service: string, event: string, data: Record<string, any> = {}) {
  const logger = fastify.log as any;
  if (logger[level] && typeof logger[level] === 'function') {
    logger[level]({
      service,
      event,
      ...data,
    });
  } else {
    console.warn(`Invalid log level: ${level}`);
  }
}

initializeSocketIO(httpServer);

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
