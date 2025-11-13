import { generatePingPongAvatar } from '../utils/generatePingPongAvatar.js'

const getAllUsers =  (db) => {
    const query = `SELECT id, username, avatar_url,
        isAccountVerified, points, wins, losses, level, is_google_auth, 
        online_status, is_2fa_enabled, createdAt, updatedAt
    FROM USERS 
    ORDER BY points DESC, wins DESC, losses ASC`;
    const users = db.prepare(query);
    return users.all();
}

const getUserByID =  (db, id) => {
    const query = `SELECT id, username, avatar_url,
        isAccountVerified, points, wins, losses, level, is_google_auth, 
        online_status, is_2fa_enabled, createdAt, updatedAt FROM USERS WHERE id = ?`;
    const userID = db.prepare(query);
    return userID.get(id);
}

const getUserByEmail =  (db, email) => {
    const query = `SELECT * FROM USERS WHERE email = ?`;
    const userEmail = db.prepare(query);
    return userEmail.get(email.trim().toLowerCase());
}

const getUserByUsername =  (db, username) => {
    const query = 'SELECT * FROM USERS WHERE username = ?';
    const userUsername = db.prepare(query);
    return userUsername.get(username);
}

const createUser = (db, userData) => {
    const {
        username,
        email,
        password,
        avatar_url: originalAvatarUrl, // Rename avatar_url to originalAvatarUrl
        verificationToken,
        tokenExpiry,
    } = userData;

    const query = `
        INSERT INTO USERS 
        (username, email, password, avatar_url, verificationToken, verificationTokenExpiresAt)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const avatar_url = originalAvatarUrl || generatePingPongAvatar(username);

    const user = db.prepare(query).run(
        username,
        email.trim().toLowerCase(),
        password,
        avatar_url,
        verificationToken,
        tokenExpiry
    );

    return user.lastInsertRowid;
}

const updateOnlineStatus = (db, id, status) => {
    const stmt = db.prepare('UPDATE USERS SET online_status = ? WHERE id = ?');
    return stmt.run(status, id);
}

const recalculateRanks = (db) => {
    const users = db.prepare(`
            SELECT id FROM USERS
            ORDER BY points DESC, wins DESC, losses ASC
    `).all();

    const query = db.prepare(`
        UPDATE USERS
        SET rank = ?
        WHERE id = ? 
    `);

    db.transaction(() => {
        users.forEach((user, index) => {
            query.run(index + 1, user.id);
        });
    })(); 
}

const userModel = { getUserByID, getUserByEmail, getUserByUsername, getAllUsers, createUser, updateOnlineStatus, recalculateRanks}

export default userModel;
