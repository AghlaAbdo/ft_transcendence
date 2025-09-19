import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server as SocketIOServer } from "socket.io";
import { getMessages, insert_message, getMessage } from "./database/conversations.js";
import { getChats } from "./database/chats.js";

const fastify = Fastify();
await fastify.register(cors, { origin: "*" });
const io = new SocketIOServer(fastify.server, { cors: { origin: "*" } });
declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

io.on("connection", (socket) => {
  const use__rId = socket.handshake.auth.user_id;
   if (!use__rId) return socket.disconnect();
  // 2. attach it to the socket object (so you can use it later)
  socket.userId = use__rId;

  console.log("User connected:", socket.userId);

  socket.on("ChatMessage", (data) => {
    const chat_id = data.chatId;
    const content = data.message;
    // 1. Call insert_message and store the complete message object
    const newMessage = insert_message(
      chat_id,
      data.sender,
      data.receiver,
      content
    );
    // console.log(newMessage)
    if (newMessage) {
      io.to(`chat:${chat_id}`).emit("ChatMessage", newMessage);
    }
  });
  socket.on("joinChat", (chat_selected) => {
    socket.join(`chat:${chat_selected}`);
    console.log("user join chat: ", chat_selected);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4545, host: "0.0.0.0" });
    console.log("Chat-service running on :4545");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
fastify.get("/", (req, rep) => {
  rep.send("hello world pro");
});

fastify.get("/shutdown", (req, rep) => {
  // fucking linux make me do this
  process.exit(0);
});

fastify.get("/api/chat/messages/:chatId", (request, reply) => {
  const { chatId } = request.params as { chatId: string };
  return getMessages(parseInt(chatId));
});``

fastify.get("/api/chat/message/:MessageId", (request, reply) => {
  const { MessageId } = request.params as { MessageId: string };
  return getMessage(parseInt(MessageId));
});

fastify.get("/api/chat/chats/:userId", (request, reply) => {
  const { userId } = request.params as { userId: string };
  // console.log("user ", + userId + "asks for chats list");
  // if (!Number.isInteger(userId))
  // return reply.status(400).send({ error: "invalid userId" });
  return getChats(parseInt(userId));
});
