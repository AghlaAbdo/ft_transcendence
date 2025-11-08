import createApp from "./app.js";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";

const fastify = createApp();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

import notoficationModel from "./models/notoficationModel.js";

const onlineUsers = new Map();

const handleConnection = (fastify, socket) => {
  const user__id = parseInt(
      (socket.handshake).auth?.user_id ||
      (socket.handshake.query.user_id) ||
      (socket.handshake.headers["user_id"])
    );
  if (isNaN(user__id)) {
    return socket.disconnect();
  }

  socket.userId = user__id;
  if (!onlineUsers.has(user__id)) {
    onlineUsers.set(user__id, new Set());
  }
  onlineUsers.get(user__id).add(socket);

  socket.on("Notification", async (data) => {
    try {
      const { user_id, actor_id, type } = data;
      if (!actor_id || !type || !user_id) return;

      const new_notification = notoficationModel.insert_notification(
        fastify.db,
        user_id,
        actor_id,
        type
      );
      if (!new_notification) {
        return socket.emit("error", { message: "Failed to insert message" });
      }

      const receiverSockets = onlineUsers.get(actor_id);
        if (receiverSockets) {
          receiverSockets.forEach((receiversocket) =>{
            receiversocket.emit("Notification", new_notification);
          })
        }
    } catch (err) {
      socket.emit("error", { message: "Failed to send notification" });
    }
  });

  socket.on("disconnect", () => {
      if (socket.userId) {
        const disconnect_socket = onlineUsers.get(socket.userId);
        if (disconnect_socket) {
          disconnect_socket.delete(socket);
        }
        if (disconnect_socket) {
          if (disconnect_socket.size === 0)
              onlineUsers.delete(socket.userId);
        }
      }
    });
};

const start = async () => {
  try {
    await fastify.register(cors, { origin: "*" });
    await fastify.listen({
      port: PORT,
      host: HOST,
    });
    console.log(`User service running on http://${HOST}:${PORT}`);
    const io = new Server(fastify.server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => handleConnection(fastify, socket));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
