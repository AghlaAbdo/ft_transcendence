import { FastifyRequest, FastifyReply } from "fastify";
import { getMessages } from "../database/conversations.js";
import { getChats } from "../database/chats.js";
import { config } from "../config/env.js";

interface GetMessagesParams {
  chatId: string;
  otherUserId: string;
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
      const res = await fetch(
        `${config.userServiceUrl}/api/friends/friend_data_backend/${userid}/${otherUserId}`,
        {
          headers: { "x-internal-key": config.internalApiKey },
        }
      );
      if (!res.ok)
        return reply
          .status(500)
          .send({ error: "Failed to fetch friendship data" });
      const data = await res.json();

      if (!data.status)
        return reply.status(403).send({
          status: false,
          error: "Failed to fetch friendship data",
        });
      if (data.status &&  data.friends.length === 0) {
        return reply.status(403).send({
          status: false,
          error: "Not authorized to view messages from non-friends",
        });
      }
    }

    const result = getMessages(db, chatId);

    if (!result.status || !result.messages) {
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

async function fetchUserFromService(ids: number[]) {
  if (!ids || ids.length === 0) {
    return [];
  }

  // if (!INTERNAL_API_KEY) return null;
   const users = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`${config.userServiceUrl}/api/users/${id}`, {
            headers: { "x-internal-key": config.internalApiKey },
          });
          if (!res.ok) return null;
          const data = await res.json();
          return data.user;
        } catch (err) {
          console.error(`Error fetching user ${id}:`);
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
  const userId = (req as any).user.id;

  if (isNaN(userId) || userId <= 0) {
    return reply.status(401).send({ error: "Invalid userId" });
  }

  try {
    const db = (req.server as any).db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(401).send({ error: "Database not initialized" });
    }

    const response = getChats(db, userId);
    if (!response || !response.status)
        return reply.status(500).send({error: "some went wrong!"});
    if (response.result.length == 0) {
      return reply.status(200).send([]);
    }

    const result = response.result;
    const userIds = Array.from(
      new Set(
        result
          .flatMap((c) => [(c as any).sender, (c as any).receiver])
          .filter((id) => typeof id === "number" && id > 0)
      )
    );

    if (userIds.length === 0) {
      return reply.status(200).send(result);
    }

    const users = await fetchUserFromService(userIds);
    if (!users || users.length < 0)
      return reply.status(400).send({ error: "Failed to fetch chats" });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enriched = result.map((chat: any) => ({
      ...chat,
      sender: userMap.get(chat.sender) || null,
      receiver: userMap.get(chat.receiver) || null,
    }));

    return reply.status(200).send(enriched);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return reply.status(301).send({ error: "Failed to fetch chats" });
  }
}

export async function checkChatExistsHandler(
  req: FastifyRequest<{ Params: CheckChatExistsParams }>,
  reply: FastifyReply
) {
  const userId = (req as any).user.id;
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

    const result = stmt.get(userId, friendId, friendId, userId)

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
