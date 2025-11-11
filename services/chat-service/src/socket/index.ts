import { Server, Socket } from "socket.io";
import { create_new_chat, insert_message } from "../database/conversations.js";
import Database from "better-sqlite3";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "pingpongsupersecretkey123";

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const onlineUsers: Map<number, Set<Socket>> = new Map();
export function initSocket(server: any, db: Database.Database) {
  const handleConnection = (
    socket: Socket,
    data: { id: string; username: string }
  ) => {
    const user__id = parseInt(data.id);

    if (isNaN(user__id)) {
      console.log("Invalid user ID — disconnecting socket");
      return socket.disconnect();
    }
    socket.userId = user__id;
    if (!onlineUsers.has(user__id)) {
      onlineUsers.set(user__id, new Set());
    }
    onlineUsers.get(user__id)!.add(socket);

    socket.on("block", async (data) => {
      const { actor_id, target_id } = data;
      if (!actor_id || !target_id)
        return socket.emit("error", { message: "Invalid data" });
       console.log('------->-----cure: ', actor_id, ", tage: ", target_id);
      try {
        console.log("actor_id: ", actor_id);
        console.log("target_id: ", target_id);

        const response = await fetch(
          `http://user-service:5000/api/friends/block`,
          {
            method: "POST",
            headers: {
              "x-internal-key": "pingpongsupersecretkey",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ actor_id, target_id }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          socket.emit("error", { message: "can not block user" });
          console.log("error : ", data);
          return ;
        }
        const sendersockets = onlineUsers.get(actor_id);
        if (sendersockets) {
          sendersockets.forEach((s) => {
            s.emit("block", { actor_id, target_id });
          });
        }
        const receiverSockets = onlineUsers.get(target_id);
        if (receiverSockets) {
          receiverSockets.forEach((receiversocket) => {
            receiversocket.emit("block", { actor_id, target_id });
          });
        }
      } catch (err) {
        console.error("some thing went wrong: ", err);
      }
    });

    socket.on("unblock", async (data) => {
      const { actor_id, target_id } = data;
      if (!actor_id || !target_id)
        return socket.emit("error", { message: "Invalid data" });
       console.log('------->-----cure: ', actor_id, ", tage: ", target_id);
      try {
        console.log("actor_id: ", actor_id);
        console.log("target_id: ", target_id);
        const response = await fetch(
          `http://user-service:5000/api/friends/unblock`,
          {
            method: "POST",
            headers: {
              "x-internal-key": "pingpongsupersecretkey",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ actor_id, target_id }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.log("error    : ", data);
          socket.emit("error", { message: "can not block user" });
          return
        }

        const sendersockets = onlineUsers.get(actor_id);
        if (sendersockets) {
          sendersockets.forEach((s) => {
            s.emit("unblock", { actor_id, target_id });
          });
        }

        const receiverSockets = onlineUsers.get(target_id);
        if (receiverSockets) {
          receiverSockets.forEach((receiversocket) => {
            receiversocket.emit("unblock", { actor_id, target_id });
          });
        }
      } catch (err) {
        console.error("some thing went wrong: ", err);
      }
    });
  
    socket.on("ChatMessage", async (data) => {
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

  io.use((socket, next) => {
    let token: string | undefined;
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      const cookies = cookie.parse(cookieHeader);
      token = cookies.token;
    }

    if (!token) {
      console.log("No token found");
      next(new Error("NO_TOKEN"));
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
      };
      handleConnection(socket, decoded);
      next();
    } catch (err) {
      return next(new Error("INVALID_TOKEN"));
    }
  });
  return io;
}
