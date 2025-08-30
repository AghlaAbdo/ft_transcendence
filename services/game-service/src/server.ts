import { createServer, IncomingMessage, ServerResponse } from 'http';
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { initializeSocketIO } from './socket/manager';
import { initializeDb, getDb } from './database/db';
import apiRouter from './api/router';




// Define the port for the server
const PORT = 4000;

const httpServer = createServer();

// The serverFactory function now returns the shared httpServer instance
const serverFactory = (handler: (req: IncomingMessage, res: ServerResponse) => void) => {
  // We attach Fastify's handler to the existing server's 'request' event
  httpServer.on('request', handler);
  return httpServer;
};

// Create a Fastify instance using the custom server factory
const fastify: FastifyInstance = Fastify({
  serverFactory: serverFactory
});

initializeSocketIO(httpServer);

fastify.addHook('onReady', ()=> {
  initializeDb();
  fastify.decorate('db', getDb());
});

fastify.register(apiRouter, {prefix: '/api'});

// Register a route
fastify.get('/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

// Start the server
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
