import { Server, Socket } from "socket.io";
import {
  create_new_chat,
  get_existing_chat,
  insert_message,
} from "../database/conversations.js";
import Database from "better-sqlite3";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { checkFriendshipStatus } from "../database/chats.js";
import {config } from "../config/env.js"

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

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
      const { target_id } = data;
      const actor_id = socket.userId;
      if (!actor_id || !target_id)
        return socket.emit("error", { message: "Invalid data" });
      try {
        console.log("actor_id: ", actor_id);
        console.log("target_id: ", target_id);
        const response = await fetch(
          `${config.userServiceUrl}/api/friends/block`, // front
          {
            method: "POST",
            headers: {
              "x-internal-key": config.internalApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ actor_id, target_id }),
          }
        );
        if (!response.ok) 
            return socket.emit("error", { message: "can not block user" });

        const data = await response.json();

        if (!data.status)
            return socket.emit("error", { message: data.message});
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
      const {target_id } = data;
      const actor_id = socket.userId;
      if (!actor_id || !target_id)
        return socket.emit("error", { message: "Invalid data" });
      try {
        const response = await fetch(
          `${config.userServiceUrl}/api/friends/unblock`,
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
        if (!response.ok) 
            return socket.emit("error", { message: "can not block user" });

        if (!data.status)
            return socket.emit("error", { message: data.message});

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
        const { chatId, receiver, message } = data;
        const sender = socket.userId;
        if (
          typeof sender !== "number" ||
          typeof receiver !== "number" ||
          typeof message !== "string" ||
          message.trim().length === 0
        ) {
          return socket.emit("error", { message: "Invalid message data" });
        }

        if (!sender || !receiver || !message)
          return socket.emit("error", { message: "Failed to insert message" });

        if (sender === receiver) {
          return socket.emit("error", {
            message: "Cannot send messages to yourself",
          });
        }
        if (message.trim().length > 1000) {
          return socket.emit("error", { message: "Message too long" });
        }

        if (chatId !== -1 && (typeof chatId !== "number" || chatId <= 0)) {
          return socket.emit("error", { message: "invalid chat ID" });
        }

        const friendshipCheck = await checkFriendshipStatus(sender, receiver);
        if (!friendshipCheck.canChat) {
          return socket.emit("error", { message: friendshipCheck.reason });
        }

        let actualChatId = chatId;

        if (chatId === -1) {
          const existingChatId = get_existing_chat(db, sender, receiver);
          if (existingChatId) {
            actualChatId = existingChatId;
            console.log(
              `Using existing chat ${existingChatId} between ${sender} and ${receiver}`
            );
          } else {
            actualChatId = create_new_chat(db, sender, receiver, message);
            if (!actualChatId) {
              return socket.emit("error", { message: "Failed to create chat" });
            }
          }
        }
        if (!actualChatId)
          return socket.emit("error", {
            message: "Failed to create new chat!",
          });

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
      if (!JWT_SECRET) return next(new Error("no secret provided"));
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
