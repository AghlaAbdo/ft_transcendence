import { FastifyRequest, FastifyReply } from "fastify";
import { getMessages, getMessage } from "../database/conversations.js";
import { getChats } from "../database/chats.js";

type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
};

// Request parameter interfaces
interface GetMessagesParams {
  chatId: string;
  otherUserId: string
}

interface GetMessageParams {
  messageId: string;
}

interface GetChatsParams {
  userId: string;
}

interface CheckChatExistsParams {
  userId: string;
  friendId: string;
}

export async function getMessagesHandler(
  req: FastifyRequest<{ Params: GetMessagesParams }>,
  reply: FastifyReply
) {
  console.log('aloooo');
  const chatId = parseInt(req.params.chatId);
  const userid = (req as any).user.id;
  const otherUserId = parseInt(req.params.otherUserId);

  if (isNaN(chatId) || chatId <= 0) {
    return reply.status(400).send({ error: "Invalid chatId" });
  }

  try {
    const db = (req.server as any).db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    if (userid && otherUserId) {

      const res = await fetch(`http://user-service:5000/api/friends/friend_data_backend/${userid}/${otherUserId}`, {
        headers: { "x-internal-key": "pingpongsupersecretkey" },
      });
      if (!res.ok) console.log('its null');
      const data = await res.json();
      console.log("friend data :", data);
    }

    const result = getMessages(db, chatId);

    if (!result.status || !result.messages || result.messages.length === 0) {
      return reply
        .status(404)
        .send({ error: "No messages found for this chat" });
    }
    return reply.status(200).send(result);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return reply.status(500).send({ error: "Failed to fetch messages" });
  }
}

export async function getMessageHandler(
  req: FastifyRequest<{ Params: GetMessageParams }>,
  reply: FastifyReply
) {
  const messageId = parseInt(req.params.messageId);

  if (isNaN(messageId) || messageId <= 0) {
    return reply.status(400).send({ error: "Invalid messageId" });
  }

  try {
    const db = (req.server as any).db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }

    const result = getMessage(db, messageId) as any;

    if (!result || !result.status || !result.message) {
      return reply.status(404).send({ error: "Message not found" });
    }

    return reply.status(200).send(result.message);
  } catch (err) {
    console.error("Error fetching message:", err);
    return reply.status(500).send({ error: "Failed to fetch message" });
  }
}

async function fetchUserFromService(ids: number[]) {
  if (!ids || ids.length === 0) {
    return [];
  }

  const users = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`http://user-service:5000/api/users/${id}`, {
            headers: { "x-internal-key": "pingpongsupersecretkey" },
          });
          if (!res.ok) return null;
          const data = await res.json();
          return data.user ?? null;
        } catch (err) {
          console.error(
            `Error fetching user ${id}:`,
            err instanceof Error ? err.message : err
          );
          return null;
        }
      })
    )
  ).filter(Boolean);

  return users;
}

export async function getChatsHandler(
  req: FastifyRequest<{ Params: GetChatsParams }>,
  reply: FastifyReply
) {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId) || userId <= 0) {
    return reply.status(400).send({ error: "Invalid userId" });
  }

  try {
    const db = (req.server as any).db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }

    const result: ChatRow[] = getChats(db, userId);

    if (!result || result.length === 0) {
      return reply.status(200).send([]);
    }

    const userIds = Array.from(
      new Set(
        result
          .flatMap((c) => [c.sender, c.receiver])
          .filter((id) => typeof id === "number" && id > 0)
      )
    );

    if (userIds.length === 0) {
      return reply.status(200).send(result);
    }

    const users = await fetchUserFromService(userIds);
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enriched = result.map((chat) => ({
      ...chat,
      sender: userMap.get(chat.sender) || null,
      receiver: userMap.get(chat.receiver) || null,
    }));

    return reply.status(200).send(enriched);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return reply.status(500).send({ error: "Failed to fetch chats" });
  }
}

export async function checkChatExistsHandler(
  req: FastifyRequest<{ Params: CheckChatExistsParams }>,
  reply: FastifyReply
) {
  const userId = parseInt(req.params.userId);
  const friendId = parseInt(req.params.friendId);

  if (isNaN(userId) || userId <= 0) {
    return reply.status(400).send({ error: "Invalid userId" });
  }

  if (isNaN(friendId) || friendId <= 0) {
    return reply.status(400).send({ error: "Invalid friendId" });
  }

  if (userId === friendId) {
    return reply
      .status(400)
      .send({ error: "Cannot create chat with yourself" });
  }

  try {
    const db = (req.server as any).db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }

    const stmt = db.prepare(`
      SELECT chat_id
      FROM chats
      WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
      LIMIT 1
    `);

    const result = stmt.get(userId, friendId, friendId, userId) as
      | { chat_id: number }
      | undefined;

    if (result) {
      return reply.status(200).send({ exists: true, chat_id: result.chat_id });
    } else {
      return reply.status(200).send({ exists: false, chat_id: -1 });
    }
  } catch (err) {
    console.error("Error checking chat existence:", err);
    return reply.status(500).send({ error: "Failed to check chat" });
  }
}
