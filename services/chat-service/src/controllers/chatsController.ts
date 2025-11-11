import {
  getMessages,
  insert_message,
  getMessage,
  create_new_chat,
} from "../database/conversations.js";
import { getChats } from "../database/chats.js";

type ChatRow = {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id: number;
};

export async function getMessagesHandler(req: any, reply: any) {
  const chatId = parseInt((req.params as any).chatId);
  if (isNaN(chatId)) return reply.status(400).send({ error: "Invalid chatId" });

  try {
    const db = req.server.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    return getMessages(db, chatId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch messages" });
  }
}

// export async function first_message(req: ) {

//   try {
//     const db = req.server.db;
//     if (!db)
//     {
//       console.error("db plugin not available");
//       return rep.status(500).send({error: "database not initialized"})
//     }
//     return create_new_chat(db,)
//   } catch {

//   }
// }

export async function getMessageHandler(req: any, reply: any) {
  const messageId = parseInt((req.params as any).messageId);
  if (isNaN(messageId))
    return reply.status(400).send({ error: "Invalid messageId" });

  try {
    const db = req.server.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    return getMessage(db, messageId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch message" });
  }
}

// export async function getUserHandler(req: any, reply: any) {
//   const userId = parseInt((req.params as any).userId);
//   if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

//   try {
//     return getUser(userId);
//   } catch (err) {
//     console.error(err);
//     return reply.status(500).send({ error: "Failed to fetch user" });
//   }`
// }

async function fetchUserFromService(ids: number[]) {
  const users = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`http://user-service:5000/api/users/${id}`, {
            headers: { 'x-internal-key': 'pingpongsupersecretkey' }
          });
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

export async function getChatsHandler(req: any, reply: any) {
  const userId = parseInt((req.params as any).userId);
  if (isNaN(userId)) return reply.status(400).send({ error: "Invalid userId" });

  try {
    const db = (req as any).server?.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    const result: ChatRow[] = getChats(db, userId);
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
}

export async function checkChatExistsHandler(req: any, rep: any) {
  const userId = parseInt((req.params).userId);
  const friendId = parseInt((req.params).friendId);
  try {
    const db = req.server.db;
    if (!db) {
      return rep.status(500).send({ error: "Database not initialized" });
    }
    const stmt = db.prepare(`
      SELECT chat_id
      FROM chats
      WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
      LIMIT 1
      `);
      const result = stmt.get(userId, friendId, friendId, userId);
      if (result) {
        return {exists: true,chat_id: result.chat_id}
      }
      else {
        return { exists: false, chat_id: -1 };
      }
  } catch (err) {
    return rep.status(500).send({ error: "Failed to check chat" });
  }
}
