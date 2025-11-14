import friendModel from "../models/friendModel.js";

import logEvent from "../app.js";

const getAllFriends = async (request, reply) => {
  try {
    const user_id = parseInt(request.params.id);
    const db = request.server.db;

    const friends = friendModel.getFriends(db, user_id);

    if (!friends || friends.length == 0) {
      return reply.send({
        status: true,
        friends: [],
        message: "No friends found",
      });
    }

    reply.code(200).send({
      status: true,
      friends: friends,
      count: friends.length,
    });
  } catch (error) {
    console.error("Error in getAllFriends:", error);
    return reply.code(400).send({
      status: false,
      message: error.message,
    });
  }
};

const getFriendData = async (request, reply) => {
  try {
    const user_id = request.user.id;
    const friend_id = parseInt(request.params.id);
    const db = request.server.db;

    const friend = friendModel.getFriendData(db, user_id, friend_id);

    if (!friend || friend.length == 0) {
      return reply.send({
        status: true,
        friends: [],
        message: "Friend not found or not accepted/blocked relationship.",
      });
    }

    reply.code(200).send({
      status: true,
      friends: friend,
    });
  } catch (error) {
    console.error("Error in getFriendData:", error);
    return reply.code(400).send({
      status: false,
      message: error.message,
    });
  }
};


const getFriendData_backend = async (request, reply) => {

  try {
    const friend_id = parseInt(request.params.friendid);
    const user_id = parseInt(request.params.userid);
    const db = request.server.db;
    if (!db)
        return reply.send({
        status: true,
        friends: [],
        message: "some thing went wrong!",
      });

    const friend = friendModel.getFriendData(db, user_id, friend_id);

    if (!friend || friend.length == 0) {
      return reply.send({
        status: true,
        friends: [],
        message: "Friend not found or not accepted/blocked relationship.",
      });
    }

    reply.code(200).send({
      status: true,
      friends: friend,
    });
  } catch (error) {
    console.error("Error in getFriendData:", error);
    return reply.code(400).send({
      status: false,
      message: error.message,
    });
  }
};
// Get friend requests RECEIVED by me
const getPendingRequests = async (request, reply) => {
  try {
    const user_id = request.user.id;
    const db = request.server.db;

    const requests = friendModel.getPendingRequests(db, user_id);

    reply.code(200).send({
      status: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    return reply.code(400).send({
      status: false,
      message: error.message,
    });
  }
};

const sendFriendRequest = async (request, reply) => {
  try {
    const user_id = request.user.id;
    const { friend_id } = request.body;

    if (!friend_id) {
      return reply
        .code(400)
        .send({ status: false, message: "friend_id is required" });
    }

    const db = request.server.db;

    const id = friendModel.sendFriendRequest(db, { user_id, friend_id });

    reply.send({
      status: true,
      message: "Friend request sent successfully!",
      friendRequestId: id,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("already")
      ? 409
      : 500;

    return reply.code(statusCode).send({
      status: false,
      message: error.message,
    });
  }
};

const acceptFriendRequest = async (request, reply) => {
  try {
    const requester_id = parseInt(request.params.id);
    const accepter_id = request.user.id;

    if (!requester_id) {
      return reply.code(400).send({
        status: false,
        message: "user_id is required",
      });
    }

    if (requester_id === accepter_id) {
      return reply.code(400).send({
        status: false,
        message: "Cannot accept your own request",
      });
    }

    const db = request.server.db;

    friendModel.acceptFriendRequest(db, {
      user_id: requester_id,
      friend_id: accepter_id,
    });

    db.prepare(
      `
            DELETE from notifications
            WHERE user_id = ? 
            AND actor_id = ?`
    ).run(requester_id, accepter_id);

    logEvent("info", "user", "friend_request", { action: "accept" });
    reply.code(200).send({
      status: true,
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;

    return reply.code(statusCode).send({
      status: false,
      message: error.message,
    });
  }
};

const rejectFriendRequest = async (request, reply) => {
  try {
    const requester_id = parseInt(request.params.id);
    const accepter_id = request.user.id;

    if (!requester_id) {
      return reply.code(400).send({
        status: false,
        message: "user_id is required",
      });
    }

    if (requester_id === accepter_id) {
      return reply.code(400).send({
        status: false,
        message: "Cannot accept your own request",
      });
    }

    const db = request.server.db;

    friendModel.rejectFriend(db, {
      user_id: requester_id,
      friend_id: accepter_id,
    });

    db.prepare(
      `
            DELETE from notifications
            WHERE user_id = ? 
            AND actor_id = ?`
    ).run(requester_id, accepter_id);

    logEvent("info", "user", "friend_request", { action: "reject" });
    return reply.code(200).send({
      status: true,
      message: "Friend request rejected successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return reply.code(statusCode).send({
      status: false,
      message: error.message,
    });
  }
};

const removeFriend = async (request, reply) => {
  try {
    const user_id = request.user.id;
    const friend_id = parseInt(request.params.friend_id);

    if (!friend_id) {
      return reply.code(400).send({
        status: false,
        message: "friend_id is required",
      });
    }

    if (user_id === friend_id) {
      return reply.code(400).send({
        status: false,
        message: "Invalid operation",
      });
    }

    const db = request.server.db;

    friendModel.rejectFriend(db, { user_id, friend_id });

    return reply.code(200).send({
      status: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;

    return reply.code(statusCode).send({
      status: false,
      message: error.message,
    });
  }
};

const searchQuery = async (request, reply) => {
  try {
    const user_id = parseInt(request.params.id);
    const { query } = request.query;

    const trimQuery = query?.trim();

    if (!trimQuery || trimQuery.length < 2) {
      return reply.code(400).send({
        status: false,
        message: "Query must be at least 2 characters",
      });
    }

    const db = request.server.db;
    const friends = friendModel.sreachQueryFriends(db, user_id, trimQuery);

    reply.code(200).send({
      status: true,
      friends: friends,
      count: friends.length,
    });
  } catch (error) {
    console.error("Error in searchQuery:", error);
    return reply.code(400).send({
      status: false,
      message: error.message || "failed to search friends",
    });
  }
};

const blockFriend = async (request, reply) => {
  try {
    const { actor_id, target_id } = request.body;
    const currentUserId = actor_id;
    const targetUserId = target_id;
    if (!currentUserId || !targetUserId) {
      return reply.code(400).send({
        status: false,
        message: "Invalid user ID",
      });
    }

    if (currentUserId === targetUserId) {
      return reply.code(400).send({
        status: false,
        message: "Cannot block yourself",
      });
    }
    const db = request.server.db;
    if (!db)
      return reply.code(400).send({
        status: false,
        message: "some thing went wrong",
      });
    const targetUser = db
      .prepare(
        `
            SELECT id FROM USERS
            WHERE id = ?
        `
      )
      .get(targetUserId);

    if (!targetUser) {
      return reply.code(404).send({
        status: false,
        message: "User not found",
      });
    }

    friendModel.blockFriend(db, { currentUserId, targetUserId });
    // friendModel.blockFriend(db, {currentUserId, targetUserId});

    return reply.code(200).send({
      status: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    return reply.code(400).send({
      status: false,
      message: error.message || "Failed to block user",
    });
  }
};

const unblockFriend = async (request, reply) => {
  // console.log('hereeee niga-------------------: ');
  try {
    const { actor_id, target_id } = request.body;
    console.log("------------------>", actor_id, target_id);
    const currentUserId = actor_id;
    const targetUserId = target_id;

    console.log("------>", currentUserId, targetUserId);
    if (!currentUserId || !targetUserId) {
      return reply.code(400).send({
        status: false,
        message: "Invalid user ID",
      });
    }

    if (currentUserId === targetUserId) {
      return reply.code(400).send({
        status: false,
        message: "Cannot unblock yourself",
      });
    }
    const db = request.server.db;

    const targetUser = db
      .prepare(
        `
            SELECT id FROM USERS
            WHERE id = ?
        `
      )
      .get(targetUserId);

    if (!targetUser) {
      return reply.code(404).send({
        status: false,
        message: "User not found",
      });
    }

    friendModel.unblockFriend(db, { currentUserId, targetUserId });

    return reply.code(200).send({
      status: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    return reply.code(400).send({
      status: false,
      message: error.message || "Failed to block user",
    });
  }
};

export default {
  getAllFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  searchQuery,
  blockFriend,
  unblockFriend,
  getFriendData,
  getFriendData_backend,
};
