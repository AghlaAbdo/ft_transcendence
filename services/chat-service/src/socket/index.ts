import { Server, Socket } from "socket.io";
import { insert_message } from "../database/conversations.js";

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const onlineUsers: Map<number, Socket> = new Map();

const handleConnection = (socket: Socket) => {
  const user__id = parseInt((socket.handshake as any).auth.user_id);
  if (isNaN(user__id)) {
    console.log("Invalid user ID — disconnecting socket");
    return socket.disconnect();
  }

  socket.userId = user__id;
  onlineUsers.set(user__id, socket);
  console.log("user connected:", user__id);

  /* ----------------------- Chat Message Event ----------------------- */
  socket.on("ChatMessage", async (data: any) => {
    try {
      const { chatId, sender, receiver, message } = data;
      if (!chatId || !sender || !receiver || !message) return;

      const newMessage = await insert_message(chatId, sender, receiver, message);
      if (!newMessage) return;

      socket.emit("ChatMessage", newMessage);
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) receiverSocket.emit("ChatMessage", newMessage);
    } catch (err) {
      console.error("ChatMessage error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  /* -------------------------- Disconnect ---------------------------- */

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
};

export function initSocket(server: any) {
  const io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", handleConnection);
  return io;
}
