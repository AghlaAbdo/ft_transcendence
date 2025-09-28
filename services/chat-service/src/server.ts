import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import { getMessages, insert_message, getMessage } from "./database/conversations.ts";
import { getChats } from "./database/chats.ts";
import { getFriends, getUser } from "./database/user.ts";

const fastify = Fastify();
fastify.register(cors, { origin: "*" });
const io = new Server(fastify.server, { cors: { origin: "*" } });
declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

const onlineUsers: Map<number, Socket> = new Map();

io.on("connection", (socket: Socket) => {
  const user__id = socket.handshake.auth.user_id;
  if (!user__id)
    return socket.disconnect();
  socket.userId = user__id;
  onlineUsers.set(user__id, socket); // store socket
  console.log("User connected:", socket.userId);
  socket.on("ChatMessage", (data) => {
    const chat_id = data.chatId;
    const content = data.message;
    const newMessage = insert_message(
      chat_id,
      data.sender,
      data.receiver,
      content
    );
    if (!newMessage)
        return ;
    socket.emit("ChatMessage", newMessage); // here check fi the user if a freind
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      receiverSocket.emit("ChatMessage", newMessage);
    }
  });
    socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected and removed from map`);
    }
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4545, host: "0.0.0.0" });
    console.log("Chat-service running on port: 4545");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();

fastify.get("/api/chat/messages/:chatId", (request) => {
  const { chatId } = request.params as { chatId: string };
  return getMessages(parseInt(chatId));
});

fastify.get("/api/chat/message/:MessageId", (request) => {
  const { MessageId } = request.params as { MessageId: string };
  return getMessage(parseInt(MessageId));
});

fastify.get("/api/chat/friends/:userId", (request) => {
  const { userId } = request.params as { userId: string };
  return getFriends(parseInt(userId));
});

fastify.get("/api/chat/user/:userId", (request) => {
  const { userId } = request.params as { userId: string };
  return getUser(parseInt(userId));
});

type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
};

fastify.get("/api/chat/chats/:userId",  (request, reply) => {
  const { userId } = request.params as { userId: string };
  try {
      fetch("http://user-service:5000/users/1")
        .then((res)=> res.json())
        .then((user: User)=>{
          console.log("Fetched user:", user.username);
        })
  } catch (err) {
    console.error('error ---> ',err);
    // reply.status(500).send({ error: "Failed to fetch user" });
  }
  if (!Number.isInteger(parseInt(userId)))
  return reply.status(400).send({ error: "invalid userId" });
  return getChats(parseInt(userId));
});
