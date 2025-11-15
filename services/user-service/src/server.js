import createApp from "./app.js";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const fastify = createApp();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const JWT_SECRET   = process.env.JWT_SECRET;

import notoficationModel from "./models/notoficationModel.js";

const onlineUsers = new Map();

const handleConnection = (fastify, socket, data) => {
  const user__id = parseInt(data.id);
  if (isNaN(user__id)) {
    console.log("Invalid user ID — disconnecting socket");
    return socket.disconnect();
  }
  
  socket.userId = user__id;


  if (!onlineUsers.has(user__id)) {
    onlineUsers.set(user__id, new Set());
  }
  onlineUsers.get(user__id).add(socket);

  fastify.db
    .prepare(`UPDATE USERS SET online_status = 1 WHERE id = ?`)
    .run(user__id);

  socket.on("Notification", async (data) => {
    try {
      const { user_id, actor_id, type, game_link } = data;
      if (
        typeof user_id !== "number" ||
        typeof actor_id !== "number" ||
        typeof type !== "string" ||
        type.trim().length === 0 
      ) {
        return socket.emit("error", { message: "Invalid message data" });
      }
      if (type === "game_invite" && !game_link)
          return socket.emit("error", { message: "invalide game link " });
      if (user_id !== socket.userId) {
        return socket.emit("error", { message: "Unauthorized user id" });
      }

      if (type !== "game_invite" && type != "friend_request") {
        return socket.emit("error", { message: "invlaide notification type" });
      }

      if (!actor_id || !type || !user_id) return;

      const new_notification = notoficationModel.insert_notification(
        fastify.db,
        user_id,
        actor_id,
        type,
        game_link
      );

      if (!new_notification) {
        return socket.emit("error", { message: "Failed to insert notification" });
      }
      
      const receiverSockets = onlineUsers.get(actor_id);
        if (receiverSockets) 
          {
            receiverSockets.forEach((receiversocket) => {
            receiversocket.emit("Notification", new_notification);
          });
        }
    } catch (err) {
      console.error("Notification error:", err);
      socket.emit("error", { message: "Failed to send notification" });
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          fastify.db
            .prepare(`UPDATE USERS SET online_status = 0 WHERE id = ?`)
            .run(socket.userId);
          console.log(`User ${socket.userId} has disconnected.`);
        }
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


    io.use((socket, next) => {
        let token;
        const cookieHeader = socket.handshake.headers.cookie;

        if (cookieHeader) {
          const cookies = cookie.parse(cookieHeader);
          token = cookies.token;
        }

        if (!token) {
          next(new Error("NO_TOKEN"));
          return;
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET)
          
          handleConnection(fastify, socket, decoded);
          next();
        } catch (err) {
          return next(new Error("INVALID_TOKEN"));
        }
      });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
