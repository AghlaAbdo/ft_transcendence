import Fastify, { FastifyInstance } from 'fastify';
import { initializeSocketIO } from './socket/manager';
import { initializeDb, getDb } from './database/db';

const fastify: FastifyInstance = Fastify({ logger: false });

fastify.addHook('onReady', ()=> {
  initializeDb();
  fastify.decorate('db', getDb());
});



fastify.listen({ port: 4000 }, function (err: Error | null, address: string) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  initializeSocketIO();
  console.log(`Fastify server listening on ${address}`);
});
