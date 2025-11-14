import Database from "better-sqlite3";

export function getChats(db: Database.Database, userId: number) {
  try {
    const stmt = db.prepare(`
      SELECT c.chat_id, c.sender, c.receiver, c.last_message_content, c.last_message_timestamp
      FROM chats c
      WHERE c.sender = ? OR c.receiver = ?
      ORDER BY c.last_message_timestamp DESC
    `);
    const  result = stmt.all(userId, userId);
    return {
      status: true,
      result: result }
  } catch (error) {
    console.error("Failed to get chats:", error);
    return {status: false, result:[]};
  }
}


export async function checkFriendshipStatus(userId1: number, userId2: number) {
  try {
    const response = await fetch(
      `http://user-service:5000/api/friends/friend_data_backend/${userId1}/${userId2}`,
      {
        headers: { "x-internal-key": "pingpongsupersecretkey" },
      }
    );

    if (!response.ok) {
      return { canChat: false, reason: "Failed to check friendship" };
    }

    const data = await response.json();

    if (!data.status || data.friends.length === 0) {
      return { canChat: false, reason: "Users are not friends" };
    }

    const friendship = data.friends;
  
    if (friendship.blocked_by) {
      return { canChat: false, reason: "User is blocked" };
    }

    return { canChat: true };
  } catch (err) {
    console.error("checkFriendshipStatus error:", err);
    return { canChat: false, reason: "Server error" };
  }
}