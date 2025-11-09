import createApp from "./app.js";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";

const fastify = createApp();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

import notoficationModel from "./models/notoficationModel.js";

const onlineUsers = new Map();
const disconnectTimers = new Map(); // userId -> timeout

const handleConnection = (fastify, socket) => {
    const user__id = parseInt(socket.handshake.auth.user_id);
    if (isNaN(user__id)) {
        console.log("Invalid user ID — disconnecting socket");
        return socket.disconnect();
    }

    
    
    socket.userId = user__id;

    if (disconnectTimers.has(user__id)) {
        clearTimeout(disconnectTimers.get(user__id));
        disconnectTimers.delete(user__id);
    }

    onlineUsers.set(user__id, socket);

    fastify.db.prepare(`UPDATE USERS SET online_status = 1 WHERE id = ?`).run(user__id);

    socket.on("Notification", async (data) => {
        try {
            const { user_id, actor_id, type } = data;

            if (!actor_id || !type || !user_id) return;

            const new_notification = notoficationModel.insert_notification(fastify.db, user_id, actor_id, type);
            const receiverSocket = onlineUsers.get(actor_id);
            if (receiverSocket) receiverSocket.emit("Notification", new_notification);
        } catch (err) {
            console.error("Notification error:", err);
            socket.emit("error", { message: "Failed to send notification" });
        }
    });

    /* -------------------------- Disconnect ---------------------------- */


    socket.on("disconnect", () => {
        // Delay marking offline in case user reconnects quickly (page refresh)
        const timer = setTimeout(() => {
            if (!onlineUsers.has(user__id)) {
                fastify.db.prepare(`UPDATE USERS SET online_status = 0 WHERE id = ?`).run(user__id);
                console.log(`User ${user__id} disconnected`);
            }
            disconnectTimers.delete(user__id);
        }, 2000); // 2 second delay

        disconnectTimers.set(user__id, timer);
        onlineUsers.delete(user__id);
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
