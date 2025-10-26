import Fastify from "fastify";
import cors from "@fastify/cors";
import { initSocket } from "./socket/index.js";
import chatsRoutes from "./routes/chats.js";
import dbPlugin from "./plugins/db.js";

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const fastify = Fastify();

await fastify.register(cors, { origin: "*" });
await fastify.register(dbPlugin as any);

await fastify.register(chatsRoutes as any);

fastify.setErrorHandler((error, request, reply) => {
  console.error("Fastify error:", error);
  reply.status(500).send({
    error: "Internal Server Error",
    message: error.message,
  });
});


const start = async () => {
  try {
    await fastify.listen({ port: 4545, host: "0.0.0.0" });
    const io = initSocket(fastify.server as any, (fastify as any).db);
    console.log("chat-service running on port 4545");
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();