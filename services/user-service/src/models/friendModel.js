

const getFriends = (db, id) => {
    const query = `
        SELECT u.id, u.username, u.online_status, u.avatar_url, f.status
        FROM FRIENDS f
        JOIN USERS u 
            ON (u.id = f.friend_id AND f.user_id = ?)
            OR (u.id = f.user_id AND f.friend_id = ?)
        WHERE (f.user_id = ? OR f.friend_id = ?)
        AND f.status = 'accepted'
        ORDER BY f.created_at DESC;
    `;
    const stmt = db.prepare(query);
    return stmt.all(id, id, id, id);
}

const getFriendData = (db, user_id, friend_id) => {
    const query = `
        SELECT u.id, u.username, u.online_status, u.avatar_url, f.status,
               f.user_id, f.friend_id, f.blocked_by
        FROM FRIENDS f
        JOIN USERS u 
            ON (f.user_id = ? AND u.id = f.friend_id)
            OR (f.friend_id = ? AND u.id = f.user_id)
        WHERE (f.user_id = ? AND f.friend_id = ?)
           OR (f.user_id = ? AND f.friend_id = ?)
        AND (f.status = 'accepted' OR f.status = 'blocked')
        AND u.id != ?
    `;
    const stmt = db.prepare(query);
    return stmt.get(user_id, user_id, user_id, friend_id, friend_id, user_id, user_id);
}




const sreachQueryFriends = (db, id, query) => {
    const querySQL = `
        SELECT u.id, u.username, u.online_status, u.avatar_url, f.status
        FROM FRIENDS f
        JOIN USERS u 
            ON (u.id = f.friend_id AND f.user_id = ?)
            OR (u.id = f.user_id AND f.friend_id = ?)
        WHERE (f.user_id = ? OR f.friend_id = ?)
        AND f.status = 'accepted'
        AND u.username LIKE ?
        ORDER BY f.created_at DESC;
    `;
    const stmt = db.prepare(querySQL);
    return stmt.all(id, id, id, id, `%${query}%`);
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

const blockFriend = (db, { currentUserId, targetUserId }) => {
    // console.log('cure: ', currentUserId, ", tage: ", targetUserId);
    
    const checkExisting = db.prepare(`
            SELECT id, status, blocked_by 
            FROM FRIENDS 
            WHERE (user_id = ? AND friend_id = ?) 
               OR (user_id = ? AND friend_id = ?)
    `).get(currentUserId, targetUserId, targetUserId, currentUserId);  

    if (!checkExisting) {
        throw new Error('Friendship not found');
    }

    if (checkExisting.blocked_by) {
        throw new Error('can not block user !');
    }

    const blockQuery = `
        UPDATE FRIENDS
        SET status = 'blocked', 
            blocked_by = ?
        WHERE id = ?
    `;

    const res = db.prepare(blockQuery).run(currentUserId, checkExisting.id);
    if (res.changes === 0) {
        throw new Error("Failed to update block status");
    }

    return true;
}


const unblockFriend = (db, { currentUserId, targetUserId }) => {
    // console.log('cure: ', currentUserId, ", tage: ", targetUserId);
    const checkExisting = db.prepare(`
            SELECT id, status, blocked_by 
            FROM FRIENDS 
            WHERE (user_id = ? AND friend_id = ?) 
               OR (user_id = ? AND friend_id = ?)
    `).get(currentUserId, targetUserId, targetUserId, currentUserId);  

    if (!checkExisting) {
        throw new Error('Friendship not found');
    }


    const blockQuery = `
        UPDATE FRIENDS
        SET status = 'accepted', 
            blocked_by = NULL
        WHERE id = ?
    `;

    const res = db.prepare(blockQuery).run(checkExisting.id);
    if (res.changes === 0) {
        throw new Error("Failed to update block status");
    }

    return true;
}

export default {
    getFriends,
    getPendingRequests,
    sreachQueryFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriend,
    removeFriendRequest,
    blockFriend,
    unblockFriend,
    getFriendData
}