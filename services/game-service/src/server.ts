// import Fastify, { FastifyInstance } from 'fastify';
import { initializeSocketIO } from './socket/manager';
import { initializeDb, getDb } from './database/db';
import { createServer } from 'http';

// const fastify: FastifyInstance = Fastify({ logger: false });

// fastify.addHook('onReady', ()=> {
//   initializeDb();
//   fastify.decorate('db', getDb());
// });

// const server = createServer((req, repl)=> {
//   fastify.server.emit('request', req, repl);
// })

// initializeSocketIO(server);

// server.listen(4000, ()=> {
//   console.log("http sever listening on: 4000");
// })
// fastify.listen({ port: 4000 }, function (err: Error | null, address: string) {
  
//   fastify.ready().then(()=>{
//   })
//   if (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
//   console.log(`Fastify server listening on ${address}`);
// });

import http, { IncomingMessage, ServerResponse } from 'http';
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';

// Define the port for the server
const PORT = 4000;

const httpServer = http.createServer();

// The serverFactory function now returns the shared httpServer instance
const serverFactory = (handler: (req: IncomingMessage, res: ServerResponse) => void) => {
  // We attach Fastify's handler to the existing server's 'request' event
  httpServer.on('request', handler);
  return httpServer;
};

// Create a Fastify instance using the custom server factory
const fastifyInstance: FastifyInstance<http.Server> = fastify({
  serverFactory: serverFactory
});

initializeSocketIO(httpServer);

// Register a route
fastifyInstance.get('/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

// Start the server
const start = async () => {
  try {
    await fastifyInstance.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastifyInstance.log.error(err);
    process.exit(1);
  }
};

start();
