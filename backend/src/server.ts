import { Server } from "socket.io";
import Fastify, { FastifyInstance } from "fastify";
import { Server as HttpServer } from "http";
import { initializeSocketIO } from "./socket/manager";

const   fastify: FastifyInstance = Fastify({ logger: false });

fastify.listen({ port: 4000 }, function (err: Error | null, address: string) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    initializeSocketIO(fastify.server as HttpServer );
    console.log(`Fastify server listening on ${address}`);
});
