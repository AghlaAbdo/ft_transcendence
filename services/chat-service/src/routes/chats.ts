import { FastifyInstance } from "fastify";
import {
  getMessagesHandler,
  getChatsHandler,
  checkChatExistsHandler,
} from "../controllers/chatsController.js";

export default async function chatsRoutes(fastify: FastifyInstance) {
  fastify.get("/api/chat/messages/:chatId/:otherUserId", {
    onRequest: [(fastify as any).authenticate]
  }, getMessagesHandler);
  
  fastify.get("/api/chat/chats", {
    onRequest: [(fastify as any).authenticate]
  }, getChatsHandler);
  
  fastify.get('/api/chat/check/:friendId', {
    onRequest: [(fastify as any).authenticate]
  }, checkChatExistsHandler);
}
