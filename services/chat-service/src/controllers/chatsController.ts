import {
  getMessages,
  getMessage,
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
  
  if (isNaN(chatId) || chatId <= 0) {
    return reply.status(400).send({ error: "Invalid chatId" });
  }

  try {
    const db = req.server.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    
    const result = getMessages(db, chatId);
    
    if (!result.status || !result.messages || result.messages.length === 0) {
      return reply.status(404).send({ error: "No messages found for this chat" });
    }

    return result;
  } catch (err) {
    console.error("Error fetching messages:", err);
    return reply.status(500).send({ error: "Failed to fetch messages" });
  }
}

export async function getMessageHandler(req: any, reply: any) {
  const messageId = parseInt((req.params).messageId);
  
  if (isNaN(messageId) || messageId <= 0) {
    return reply.status(400).send({ error: "Invalid messageId" });
  }

  try {
    const db = req.server.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    
    const message = getMessage(db, messageId);
    
    if (!message) {
      return reply.status(404).send({ error: "Message not found" });
    }
    
    return message;
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
            // headers: { 'Content-Type': 'application/json' },
            // signal: AbortSignal.timeout(5000), 
          });
          
          if (!res.ok) {
            console.warn(`Failed to fetch user ${id}: ${res.status} ${res.statusText}`);
            return null;
          }
          
          const data = await res.json();
          return data.user ?? null;
        } catch (err) {
          console.error(`Error fetching user ${id}:`, err instanceof Error ? err.message : err);
          return null;
        }
      })
    )
  ).filter(Boolean);
  
  return users;
}

export async function getChatsHandler(req: any, reply: any) {
  const userId = parseInt((req.params as any).userId);
  
  if (isNaN(userId) || userId <= 0) {
    return reply.status(400).send({ error: "Invalid userId" });
  }

  try {
    const db = (req as any).server?.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return reply.status(500).send({ error: "Database not initialized" });
    }
    
    const result: ChatRow[] = getChats(db, userId);
    
    if (!result || result.length === 0) {
      return reply.status(200).send([]);
    }
    
    const userIds = Array.from(
      new Set(result.flatMap((c) => [c.sender, c.receiver]).filter((id) => typeof id === 'number' && id > 0))
    );
    
    if (userIds.length === 0) {
      return result; // Return chats without user enrichment if no valid user IDs
    }
    
    const users = await fetchUserFromService(userIds);
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enriched = result.map((chat) => ({
      ...chat,
      sender: userMap.get(chat.sender) || null,
      receiver: userMap.get(chat.receiver) || null,
    }));

    return enriched;
  } catch (err) {
    console.error("Error fetching chats:", err);
    return reply.status(500).send({ error: "Failed to fetch chats" });
  }
}

export async function checkChatExistsHandler(req: any, rep: any) {
  const userId = parseInt((req.params).userId);
  const friendId = parseInt((req.params).friendId);
  
  if (isNaN(userId) || userId <= 0) {
    return rep.status(400).send({ error: "Invalid userId" });
  }
  
  if (isNaN(friendId) || friendId <= 0) {
    return rep.status(400).send({ error: "Invalid friendId" });
  }
  
  if (userId === friendId) {
    return rep.status(400).send({ error: "Cannot create chat with yourself" });
  }
  
  try {
    const db = req.server.db;
    if (!db) {
      console.error("DB not available on request.server.db");
      return rep.status(500).send({ error: "Database not initialized" });
    }
    
    const stmt = db.prepare(`
      SELECT chat_id
      FROM chats
      WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
      LIMIT 1
    `);
    
    const result = stmt.get(userId, friendId, friendId, userId) as { chat_id: number } | undefined;
    
    if (result) {
      return { exists: true, chat_id: result.chat_id };
    } else {
      return { exists: false, chat_id: -1 };
    }
  } catch (err) {
    console.error("Error checking chat existence:", err);
    return rep.status(500).send({ error: "Failed to check chat" });
  }
}
