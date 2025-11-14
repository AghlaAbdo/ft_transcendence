import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { initSocket } from "./socket/index.js";
import chatsRoutes from "./routes/chats.js";
import dbPlugin from "./plugins/db.js";
import authPlugin from "./plugins/midlware.js";
import fs from 'fs';
import { validateEnv } from './config/env.js';

const logStream = fs.createWriteStream('./logs/chat.log', { flags: 'a' });

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

validateEnv();

const fastify = Fastify({
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

await fastify.register(cors, { origin: "*" });
await fastify.register(fastifyCookie);
await fastify.register(dbPlugin as any);
await fastify.register(authPlugin as any);
await fastify.register(chatsRoutes as any);

fastify.addHook('onRequest', async (request, reply) => {
        logEvent('info', 'chat', 'api_request', {
            method: request.method,
            path: request.url,
        });
});


fastify.setErrorHandler((error, request, reply) => {
  console.error("Fastify error:", error);
  reply.status(400).send({
    error: "some thing went wrong",
    message: error.message,
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4545, host: "0.0.0.0" });
    initSocket(fastify.server, (fastify as any).db);
    console.log("chat-service running on port 4545");
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();