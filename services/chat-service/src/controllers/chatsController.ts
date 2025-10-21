import { getMessages, insert_message, getMessage } from "../database/conversations.js";
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
    return getMessages(chatId);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Failed to fetch messages" });
  }
}

export async function getMessageHandler(req: any, reply: any) {
  const messageId = parseInt((req.params as any).messageId);
  if (isNaN(messageId)) return reply.status(400).send({ error: "Invalid messageId" });

  try {
    return getMessage(messageId);
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
//   }
// }

async function fetchUserFromService(ids: number[]) {
  const users = (
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`http://user-service:5000/api/users/${id}`);
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
    const result: ChatRow[] = await getChats(userId);
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
