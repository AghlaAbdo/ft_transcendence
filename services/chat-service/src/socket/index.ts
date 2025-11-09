import { Server, Socket } from "socket.io";
import { create_new_chat, insert_message } from "../database/conversations.js";
import Database from "better-sqlite3";

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const onlineUsers: Map<number, Set<Socket>> = new Map();
export function initSocket(server: any, db: Database.Database) {
  const handleConnection = (socket: Socket) => {
    const user__id = parseInt(
      socket.handshake.auth?.user_id ||
        (socket.handshake.query.user_id as string) ||
        (socket.handshake.headers["user_id"] as string)
    );

    if (isNaN(user__id)) {
      console.log("Invalid user ID — disconnecting socket");
      return socket.disconnect();
    }
    socket.userId = user__id;
    if (!onlineUsers.has(user__id)) {
      onlineUsers.set(user__id, new Set());
    }
    onlineUsers.get(user__id)!.add(socket);

    // socket.on('error', (err) => {
    //   console.error(`Socket error for user ${socket.userId}:`, err);
    //   socket.disconnect();
    // });

    socket.on("ChatMessage", async (data: any) => {
      try {
        const { chatId, sender, receiver, message } = data;

        if (
          typeof sender !== "number" ||
          typeof receiver !== "number" ||
          typeof message !== "string" ||
          message.trim().length === 0
        ) {
          return socket.emit("error", { message: "Invalid message data" });
        }

        if (sender !== socket.userId) {
          return socket.emit("error", { message: "Unauthorized sender" });
        }

        if (message.length > 1000) {
          return socket.emit("error", { message: "Message too long" });
        }

        if (chatId !== -1 && (typeof chatId !== "number" || chatId <= 0)) {
          return socket.emit("error", { message: "Invalid chat ID" });
        }

        if (!sender || !receiver || !message) return;
        // console.log("data: ", data);

        let actualChatId = chatId;
        console.log("in socket handler: ", message);

        if (chatId === -1) {
          console.log(`Creating new chat between ${sender} and ${receiver}`);
          actualChatId = create_new_chat(db, sender, receiver, message);
          console.log(`New chat created with ID: ${actualChatId}`);
        }
        const newMessage = insert_message(
          db,
          actualChatId,
          sender,
          receiver,
          message
        );
        if (!newMessage) {
          return socket.emit("error", { message: "Failed to insert message" });
        }

        const sendersockets = onlineUsers.get(sender);
        if (sendersockets) {
          sendersockets.forEach((s) => {
            s.emit("ChatMessage", newMessage);
          });
        }
        const receiverSockets = onlineUsers.get(receiver);
        if (receiverSockets) {
          receiverSockets.forEach((receiversocket) => {
            receiversocket.emit("ChatMessage", newMessage);
          });
        }
      } catch (err) {
        console.error("ChatMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        const userSockets = onlineUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket);
          if (userSockets.size === 0) {
            onlineUsers.delete(socket.userId);
          }
        }
      }
    });
  };

  const io = new Server(server, {
    cors: { origin: "*" },
    pingTimeout: 60000, // if exced 60s will disconnect
    pingInterval: 25000, // ping kola 25s
    connectTimeout: 10000, // 10s to connect
  });
  io.on("connection", handleConnection);
  return io;
}
