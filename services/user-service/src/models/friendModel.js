

// CREATE TABLE IF NOT EXISTS FRIENDS (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   friend_id INTEGER NOT NULL,
//   status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//   FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
//   UNIQUE(user_id, friend_id)
// );

const getAllFriends =  (db, id) => {
    const query = `
        SELECT u.id, u.username, u.online_status, f.status
        FROM FRIENDS f
        JOIN USERS u ON u.id = f.friend_id
        WHERE f.user_id = ?
        AND f.status = 'accepted';
    `;
    const stmt = db.prapare(query);
    return stmt.all(id);
}


const sendFriendRequest = (db, { user_id, friend_id }) => {
    if (user_id === friend_id) {
        throw new Error("You cannot send a friend request to yourself.");
    }   

    const checkQuery = `
        SELECT * FROM FRIENDS 
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?);
    `;
    const existing = db.prepare(checkQuery).get(user_id, friend_id, friend_id, user_id);

    if (existing) {
        throw new Error(`Friend request already exists with status: ${existing.status}`);
    }

    const query = `
        INSERT INTO FRIENDS (user_id, friend_id, status)
        VALUES (?, ?, 'pending');
    `;
    const result = db.prepare(query).run(user_id, friend_id);
    return result.lastInsertRowid;
}



// POST /friends/accept/:id
// const acceptFriendRequest = (db, id) => {
//     const query = `
//         UPDATE FRIENDS
//         SET status = 'accepted,
//         WHERE id = ?
//     `;
//     return db.prepare(query).run(id);
// }


/*
    POST /friends/accept
    {
    "user_id": 1,
    "friend_id": 2
    }
*/
const acceptFriendRequest = (db, { user_id, friend_id }) => {
  const checkQuery = `
    SELECT * FROM FRIENDS
    WHERE (user_id = ? AND friend_id = ?)
       OR (user_id = ? AND friend_id = ?)
    AND status = 'pending';
  `;
  const existing = db.prepare(checkQuery).get(user_id, friend_id, friend_id, user_id);

  if (!existing) {
    throw new Error("No pending friend request found.");
  }

  const updateQuery = `
    UPDATE FRIENDS
    SET status = 'accepted'
    WHERE id = ?;
  `;
  const res = db.prepare(updateQuery).run(existing.id);

  return res.changes > 0;
};

const rejectFriendRequest = (db, {user_id, friend_id}) => {
    const deleteQuery = `
        DELETE FROM FRIENDS
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
        AND status = 'pending';
    `;

    const res = db.prepare(deleteQuery).run(user_id, friend_id, friend_id, user_id);

    return res.changes > 0;
}


const removeFriendRequest = (db, { user_id, friend_id }) => {
  const deleteQuery = `
    DELETE FROM FRIENDS
    WHERE ((user_id = ? AND friend_id = ?)
       OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted';
  `;
  const result = db.prepare(deleteQuery).run(user_id, friend_id, friend_id, user_id);

  return result.changes > 0;
};


const getPendingRequests = (db, id) => {
    const query =  `
        SELECT u.id, u.username, u.online_status, f.status
        FROM FRIENDS f
        JOIN USERS u ON u.id = f.friend_id
        WHERE f.user_id = ?
        AND f.status = 'pending';
    `;

    return db.prepare(query).all(id);
}