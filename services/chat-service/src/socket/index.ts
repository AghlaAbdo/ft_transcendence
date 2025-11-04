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
      (socket.handshake).auth?.user_id ||
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
    /* ----------------------- chat message event ----------------------- */
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

        const sendersockets = onlineUsers.get(sender);
        if (sendersockets) {
          sendersockets.forEach((s)=>{
            s.emit("ChatMessage", newMessage);
          })
        }
        const receiverSockets = onlineUsers.get(receiver);
        if (receiverSockets) {
          receiverSockets.forEach((receiversocket) =>{
            receiversocket.emit("ChatMessage", newMessage);
          })
        }
      } catch (err) {
        console.error("ChatMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    /* -------------------------- disconnect ---------------------------- */

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

  const io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", handleConnection);
  return io;
}
