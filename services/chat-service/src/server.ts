import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";
// import fetch from "node-fetch";
import { getMessages, insert_message, getMessage } from "./database/conversations.js";
import { getChats } from "./database/chats.js";
import { getFriends, getUser } from "./database/user.js";
import { getnotifications, insert_notification, mark_friend_request_as_read} from "./database/Notifications.js";

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const fastify = Fastify();

await fastify.register(cors, { origin: "*" });

const onlineUsers: Map<number, Socket> = new Map();

/* ---------------------------- SOCKET.IO ---------------------------- */
const handleConnection = (socket: Socket) => {
  const user__id = parseInt(socket.handshake.auth.user_id);
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
  });start

  /* ---------------------- Notifications Event ----------------------- */
  socket.on("Notification", async (data: any) => {
    try {
      const { user_id, actor_id, type} = data;
      console.log('db hhhh');

      if (!actor_id  || !type || !user_id) return;
      // console.log("user: ",user_id);
      // console.log("actor: ",actor_id);
      // console.log("message: ",message);
      // console.log("type : ",type);
      const new_notification = insert_notification(user_id, actor_id, type);
      const receiverSocket = onlineUsers.get(actor_id);
      if (receiverSocket) receiverSocket.emit("Notification", new_notification);
    } catch (err) {
      console.error("Notification error:", err);
      socket.emit("error", { message: "Failed to send notification"});
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

/* ----------------------------- ROUTES ------------------------------ */

fastify.get("/api/chat/notifications/:userId", async (req, reply) => {
  // console.log('allllllo');
  
  const userId = parseInt((req.params as any).userId);
  if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

  try {
    return  getnotifications(userId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch notifications" });
  }
});

fastify.put('/api/chat/notifications/friend_request/mark-as-read', async (req, res) => {
  console.log('this iissssssss friend');
  
  const {userId} =  req.body as { userId: number };
  return mark_friend_request_as_read(userId ,"friend_request");
});


fastify.put('/api/chat/notifications/game/mark-as-read', async (req, res) => {
  console.log('this iissssssss gamaame');
  const {userId} =  req.body as { userId: number };
  return mark_friend_request_as_read(userId, "game_invite");
});

fastify.get("/api/chat/messages/:chatId", async (req, reply) => {
  const chatId = parseInt((req.params as any).chatId);
  if (isNaN(chatId)) return reply.status(400).send({ error: "Invalid chatId" });

  try {
    return  getMessages(chatId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch messages" });
  }
});

fastify.get("/api/chat/message/:messageId", async (req, reply) => {
  const messageId = parseInt((req.params as any).messageId);
  if (isNaN(messageId)) return reply.status(400).send({ error: "Invalid messageId" });

  try {
    return  getMessage(messageId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch message" });
  }
});

fastify.get("/api/chat/friends/:userId", async (req, reply) => {
  const userId = parseInt((req.params as any).userId);
  if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

  try {
    return getFriends(userId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch friends" });
  }
});

fastify.get("/api/chat/user/:userId", async (req, reply) => {
  const userId = parseInt((req.params as any).userId);
  if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

  try {
    return getUser(userId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch user" });
  }
});

/* -------------------------- CHATS ROUTE --------------------------- */
type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
};

async function fetchUserFromService(ids: number[]) {
  const users = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`http://user-service:5000/api/users/${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return data.user ?? null;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean);
  return users;
}

fastify.get("/api/chat/chats/:userId", async (req, reply) => {
  const userId = parseInt((req.params as any).userId);
  if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

  try {
    const result: ChatRow[] = await getChats(userId);
    const userIds = Array.from(
      new Set(result.flatMap((c) => [c.sender, c.receiver]).filter(Boolean))
    );
    const users = await fetchUserFromService(userIds);
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enriched = result.map((chat) => ({
      ...chat,
      sender: userMap.get(chat.sender),
      receiver: userMap.get(chat.receiver),
    }));

    return enriched;
  } catch (err) {
    console.error("Chats error:", err);
    return reply.status(500).send({ error: "Failed to fetch chats" });
  }
});

/* ------------------------- ERROR HANDLER -------------------------- */
fastify.setErrorHandler((error, request, reply) => {
  console.error("Fastify error:", error);
  reply.status(500).send({
    error: "Internal Server Error",
    message: error.message,
  });
});
/* --------------------------- START SERVER ------------------------- */
const start = async () => {
  try {
    await fastify.listen({ port: 4545, host: "0.0.0.0" });
    const io = new Server(fastify.server, { cors: { origin: "*" } });
    io.on("connection", handleConnection);
    console.log("chat-service running on port 4545");
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();

