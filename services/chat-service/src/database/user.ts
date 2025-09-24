import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log("DB Path:", path.join(__dirname, "../database/user.db"));
const db = new Database(path.join(__dirname, "../database/user-service.db"));

export function getFriends(userId: number) {
    try {
        const stmt = db.prepare(`
            SELECT F.friend_id
            FROM FRIENDS F
            WHERE user_id = ?
        `);
        const res = stmt.all(userId);
        return res;
    } catch (err) {
        console.error("DB error:", err.message);
        throw err;
    }
}


export function getUser(userId: number) {
    try {
        const stmt = db.prepare(`
            SELECT *
            FROM USERS F
            WHERE user_id = ?
        `);
        const res = stmt.all(userId);
        return res;
    } catch (err) {
        console.error("DB error:", err.message);
        throw err;
    }
}

