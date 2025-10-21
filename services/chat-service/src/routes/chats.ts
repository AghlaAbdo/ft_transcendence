import { FastifyInstance } from "fastify";
import {
  getMessagesHandler,
  getMessageHandler,
  getChatsHandler,
} from "../controllers/chatsController.js";

export default async function (fastify: FastifyInstance) {
  fastify.get("/api/chat/messages/:chatId", getMessagesHandler);
  fastify.get("/api/chat/message/:messageId", getMessageHandler);
  fastify.get("/api/chat/chats/:userId", getChatsHandler);
}
