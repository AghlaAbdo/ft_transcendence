import { FastifyInstance } from "fastify";
import {
  getMessagesHandler,
  getMessageHandler,
  getChatsHandler,
  checkChatExistsHandler,
} from "../controllers/chatsController.js";

export default async function chatsRoutes(fastify: FastifyInstance) {
  fastify.get("/api/chat/messages/:chatId/:otherUserId", {
    onRequest: [(fastify as any).authenticate]
  }, getMessagesHandler);
  
  fastify.get("/api/chat/message/:messageId", {
    onRequest: [(fastify as any).authenticate]
  }, getMessageHandler);
  
  fastify.get("/api/chat/chats/:userId", {
    onRequest: [(fastify as any).authenticate]
  }, getChatsHandler);
  
  fastify.get('/api/chat/check/:userId/:friendId', {
    onRequest: [(fastify as any).authenticate]
  }, checkChatExistsHandler);
}
