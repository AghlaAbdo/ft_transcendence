import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server, Socket } from "socket.io";
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
  socket.on("ChatMessage", (data:any) => {
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
    socket.emit("ChatMessage", newMessage); // here check if the user if a freind
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


type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
}

// hell yeaaaaaah Promise.all its magiiic baby

async function fetchUserFromService(ids: Array<number>)
{
  const users = await Promise.all(
    (ids.map(async (id) => {
      const res = await fetch(`http://user-service:5000/api/users/${id}`);
      const data = await res.json();
      if (!data.status || !data.user) return null; // skip if not found
      // console.log('user fetched: ', data.user);
      return data.user;
    })
  ));
  
  return users;
}

fastify.get("/api/chat/chats/:userId", async (request, reply) => {
  const { userId } = request.params as { userId: string };
  console.log("user want to fetch: ", userId)
  if (!Number.isInteger(parseInt(userId))) {
    return reply.status(400).send({ error: "invalid userId" });
  }
  try {
    const result: ChatRow[] = getChats(parseInt(userId));
    const userIds = Array.from(new Set (
      result.flatMap((c) => [c.sender, c.receiver]).filter((id) => id != null))
    );
    // console.log("user: ",userIds);
    const users = await fetchUserFromService((userIds));
    console.log('users: ', users);
    
    const userMap = new Map(users.map(u => [u.id, u]));
    // console.log(userMap.get[0])
    // enrich the chat json with user infos
    const enrichedChats = result.map(chat => ({
    ...chat,
    sender: userMap.get(chat.sender),
    receiver: userMap.get(chat.receiver),
  }));
  console.log('user before: ', result);
  console.log('users after: ', enrichedChats);
    // return result;
    return enrichedChats;
    } catch (err) {
    console.error("error ---> ", err);
    return reply.status(500).send({ error: "Failed to fetch user"});
  }
});
