

const getFriends =  (db, id) => {
    const query = `
        SELECT u.id, u.username, u.online_status, u.avatar_url, f.status
        FROM FRIENDS f
        JOIN USERS u ON u.id = f.friend_id
        WHERE f.user_id = ?
        AND f.status = 'accepted';
    `;
    const stmt = db.prepare(query);
    return stmt.all(id);
}


const getPendingRequests = (db, userID) => {
    const query =  `
        SELECT u.id, u.username, u.online_status, u.avatar_url, f.status, f.created_at
        FROM FRIENDS f
        JOIN USERS u ON u.id = f.friend_id
        WHERE f.friend_id = ?
        AND f.status = 'pending'
        ORDER BY f.created_at DESC;
    `;

    return db.prepare(query).all(userID);
}



const sendFriendRequest = (db, { user_id, friend_id }) => {
    if (user_id === friend_id) {
        throw new Error("You cannot send a friend request to yourself.");
    }   


    const friendExists = db.prepare('SELECT id FROM users WHERE id = ?').get(friend_id);
    if (!friendExists) {
        throw new Error("User not found");
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

const acceptFriendRequest = (db, { user_id, friend_id }) => {
  const checkQuery = `
    SELECT * FROM FRIENDS
    WHERE user_id = ? 
    AND friend_id = ? 
    AND status = 'pending'
  `;
  const existing = db.prepare(checkQuery).get(user_id, friend_id);

  if (!existing) {
    throw new Error("No pending friend request found.");
  }

  const updateQuery = `
    UPDATE FRIENDS
    SET status = 'accepted'
    WHERE id = ?;
  `;
  const res = db.prepare(updateQuery).run(existing.id);

  
  if (res.changes === 0) {
    throw new Error("Failed to accept friend request");
  }
  
  return true;
};

const rejectFriend = (db, {user_id, friend_id}) => {
    const deleteQuery = `
        DELETE FROM FRIENDS
        WHERE user_id = ? 
        AND friend_id = ? 
        AND status = 'pending'
    `;

    const res = db.prepare(deleteQuery).run(user_id, friend_id);

    if (res.changes === 0) {
        throw new Error("Friend request not found");
    }

    return true;
}

const removeFriendRequest = (db, { user_id, friend_id }) => {
  const deleteQuery = `
    DELETE FROM FRIENDS
    WHERE ((user_id = ? AND friend_id = ?)
       OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted';
  `;
  const res = db.prepare(deleteQuery).run(user_id, friend_id, friend_id, user_id);
  
  if (res.changes === 0) {
    throw new Error("Friendship not found");
  }

  return true;
};


export default {
    getFriends,
    getPendingRequests,

    sendFriendRequest,
    acceptFriendRequest,
    rejectFriend,
    removeFriendRequest,
}