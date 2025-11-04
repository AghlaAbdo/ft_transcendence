import createApp from "./app.js";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";

const fastify = createApp();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

import notoficationModel from "./models/notoficationModel.js";

const onlineUsers = new Map();

const handleConnection = (fastify, socket) => {
    const user__id = parseInt(socket.handshake.auth.user_id);
    if (isNaN(user__id)) {
        console.log("Invalid user ID — disconnecting socket");
        return socket.disconnect();
    }

    socket.userId = user__id;
    onlineUsers.set(user__id, socket); // add set to multiple tabs

    socket.on("Notification", async (data) => {
        try {
            const { user_id, actor_id, type } = data;
            console.log('db hhhh');

            if (!actor_id || !type || !user_id) return;
            // console.log("user: ",user_id);
            // console.log("actor: ",actor_id);
            // console.log("message: ",message);
            // console.log("type : ",type);
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
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected`);
        }
    });

}

const start = async () => {
    try {
        await fastify.register(cors, { origin: "*" });
        await fastify.listen({
            port: PORT,
            host: HOST
        });
        console.log(`User service running on http://${HOST}:${PORT}`);
        // fastify.log.info(`Server runing on port ${fastify.server.address().port}`);
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
}

start();