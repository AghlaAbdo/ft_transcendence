import { Server, Socket } from "socket.io";
import { create_new_chat, insert_message } from "../database/conversations.js";
import Database from "better-sqlite3";
declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const onlineUsers: Map<number, Socket> = new Map();
// const onlineUsers: Map<number, Set<Socket>> = new Map();
export function initSocket(server: any, db: Database.Database) {
  const handleConnection = (socket: Socket) => {
    ;
    const user__id = parseInt(
      (socket.handshake).auth?.user_id ||
      (socket.handshake.query.user_id as string) ||
      (socket.handshake.headers["user_id"] as string)
    );

    if (isNaN(user__id)) {
      console.log("Invalid user ID — disconnecting socket");
      return socket.disconnect();
    }

    socket.userId = user__id;
    onlineUsers.set(user__id, socket);
    console.log("user connected:", user__id);

    /* ----------------------- chat Message Event ----------------------- */
    socket.on("ChatMessage", async (data: any) => {
      try {
        const { chatId, sender, receiver, message } = data;
        if (!sender || !receiver || !message) return;
        console.log('data: ', data);
        
        let actualChatId = chatId;
        console.log('in socket handler: ', message);
        
        // If chatId is -1, create new chat (no need to check if exists)
        if (chatId === -1) {
          console.log(`Creating new chat between ${sender} and ${receiver}`);
          actualChatId = create_new_chat(db, sender, receiver, message);
          console.log(`New chat created with ID: ${actualChatId}`);
        }
        const newMessage = insert_message(db, actualChatId, sender, receiver, message);
        if (!newMessage) {
          console.error("Failed to insert message");
          return socket.emit("error", { message: "Failed to insert message" });
        }

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

  const io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", handleConnection);
  return io;
}
