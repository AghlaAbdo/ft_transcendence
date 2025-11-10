function getnotifications(db, userId) {
  try {
    const stmt = db.prepare(`
            SELECT c.id, c.user_id, c.actor_id, c.type, c.read, c.created_at
            FROM notifications c
            WHERE c.actor_id = ?
            ORDER BY c.created_at DESC`);
    const result = stmt.all(userId);
    return {
      status: true,
      notifications: result,
    };
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return {
      status: false,
      notifications: [],
    };
  }
}

function insert_notification(db, user_id, actor_id, type, game_link) {
  if (type === "game_invite") {
    const insertStmt = db.prepare(`
    INSERT INTO notifications (user_id, actor_id, type, game_link)
    VALUES (?, ?, ? ,?)
  `);
    const info = insertStmt.run(user_id, actor_id, type, game_link);
    const notif_id = info.lastInsertRowid;
    const selectStmt = db.prepare("SELECT * FROM notifications WHERE id = ?");
    const last_notif = selectStmt.get(notif_id);
    console.log("last notification insert: ", last_notif);
    return last_notif;
  }
  const insertStmt = db.prepare(`
    INSERT INTO notifications (user_id, actor_id, type)
    VALUES (?, ?, ?)
  `);
  const info = insertStmt.run(user_id, actor_id, type);
  const notif_id = info.lastInsertRowid;
  const selectStmt = db.prepare("SELECT * FROM notifications WHERE id = ?");
  const last_notif = selectStmt.get(notif_id);
  console.log("last notification insert: ", last_notif);

  return last_notif;
}

//  function mark_friend_request_as_read(db, userId, type) {
//   console.log('allo from backendd');
//   const stmt = db.prepare(`UPDATE notifications SET read = 1 WHERE actor_id = ? AND type = ?`);
//   console.log('allo from backenddsdfsdfsdfsdfsfgfsgdghdgh');
//   stmt.run(userId, type);
//   return { status: true };
// }

function mark_friend_request_as_read(db, userId, type) {
  console.log('mark as read game: ');
  
  console.log("notifi mark as read: ", type);

  try {
    const stmt = db.prepare(
      `UPDATE notifications SET read = 1 WHERE actor_id = ? AND type = ?`
    );
    const info = stmt.run(userId, type);

    return { status: info.changes > 0 };
  } catch (error) {
    console.error("Error updating notification:", error);
    return { status: false, error: error.message };
  }
}

const notoficationModel = {
  getnotifications,
  insert_notification,
  mark_friend_request_as_read,
};

export default notoficationModel;
