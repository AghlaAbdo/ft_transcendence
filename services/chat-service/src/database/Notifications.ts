import Database from "better-sqlite3";
import { log } from "console";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;
try {
    db = new Database(path.join(__dirname, "../database/notifications.db"));
} catch (error) {
  console.error("Failed to open database:", error);
  process.exit(1); // Exit app if db can't be opened
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    actor_id INTEGER,
    type TEXT NOT NULL CHECK (type IN (
      'friend_request',
      'friend_accept',
      'game_invite',
      'message',
      'tournament_invite'
    )),
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

const insertStmt = db.prepare(`
  INSERT INTO notifications (user_id, actor_id, type)
  VALUES (?, ?, ?)
`);

export function getnotifications(userId: number) {
  try {
    const stmt = db.prepare(`
      SELECT c.id, c.user_id, c.actor_id, c.type, c.read, c.created_at
      FROM notifications c
      WHERE c.actor_id = ?
      ORDER BY c.created_at DESC
    `);
    const result = stmt.all(userId);
    return {
      status: true,
      notifications: result
    };
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return {
      status: false,
      notifications: []
    };
  }
}

const selectStmt = db.prepare('SELECT * FROM notifications WHERE id = ?');

export function insert_notification(user_id: number, actor_id: number, type: string)
{
  const info = insertStmt.run(user_id, actor_id, type);
  const notif_id = info.lastInsertRowid as number;
  const last_notif = selectStmt.get(notif_id);
  console.log('last: ', last_notif);

  return last_notif;
}

const stmt = db.prepare(`UPDATE notifications SET read = 1 WHERE actor_id = ? AND type = ?`);

export function mark_friend_request_as_read(userId: number, type: string) {
  console.log('allo from backendd');
  stmt.run(userId, type);
  return { status: true };
}
