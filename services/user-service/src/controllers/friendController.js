import friendModel from "../models/friendModel.js";

const getAllFriends = async (request, reply) => {
    try {
        const user_id = request.user.id;
        const db = request.server.db;

        const friends = friendModel.getFriends(db, user_id);


        console.log("tetstetstetste\n\n");

        if (!friends || friends.length == 0) {
            return reply.send({
                status: true,
                friends: [],
                message: 'No friends found'
            }); 
        }


        reply.code(200).send({
            status: true,
            friends: friends,
            count: friends.length
        });

    } catch (error) {
        console.error('Error in getAllFriends:', error); 
        return reply.code(500).send({
            status: false,
            message: error.message
        });       
    }
}

// Get friend requests RECEIVED by me
const getPendingRequests = async (request, reply) => {
    try {
        const user_id = request.user.id;
        const db = request.server.db;

        const requests = friendModel.getPendingRequests(db, user_id);

        reply.code(200).send( {
            status: true,
            data: requests,
            count: requests.length
        });
    } catch (error) {
        return reply.code(500).send({
            status: false,
            message: error.message
        });
    }
}

const sendFriendRequest = async (request, reply) => {
    try {
        const user_id = request.user.id;
        const { friend_id } = request.body;
            
        if (!friend_id) {
            return reply.code(400).send({ status: false, message: "friend_id is required"});
        }

        const db = request.server.db;

        const id = friendModel.sendFriendRequest(db, { user_id, friend_id });

        reply.send({
            status: true,
            message: "Friend request sent successfully!",
            friendRequestId: id
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('already') ? 409 : 500;
        
        return reply.code(statusCode).send({
            status: false,
            message: error.message
        });
    }
}

const acceptFriendRequest = async (request, reply) => {
    try {
        const requester_id = parseInt(request.params.id);
        const accepter_id = request.user.id;

        if (!requester_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "user_id is required"
            });
        }

        if (requester_id === accepter_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "Cannot accept your own request"
            });
        }

        const db = request.server.db;
        
        friendModel.acceptFriendRequest(db, {
            user_id : requester_id,
            friend_id: accepter_id
        });

        reply.code(200).send({
            status: true,
            message: "Friend request accepted successfully"
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        
        return reply.code(statusCode).send({
            status: false,
            message: error.message
        });
    }
}

const rejectFriendRequest = async (request, reply) => {
    try {
        const requester_id = parseInt(request.params.id);
        const accepter_id = request.user.id;

        if (!requester_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "user_id is required"
            });
        }

        if (requester_id === accepter_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "Cannot accept your own request"
            });
        }

        const db = request.server.db;

        friendModel.rejectFriend(db, {
            user_id : requester_id,
            friend_id: accepter_id
        });

        return reply.code(200).send({
            status: true,
            message: "Friend request rejected successfully"
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return reply.code(statusCode).send({
            status: false,
            message: error.message
        });
    }
}

const removeFriend = async (request, reply) => {
    try {
        const user_id = request.user.id;
        const friend_id = parseInt(request.params.friend_id);

        if (!friend_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "friend_id is required"
            });
        }

        if (user_id === friend_id) {
            return reply.code(400).send({ 
                status: false, 
                message: "Invalid operation"
            });
        }

        const db = request.server.db;

        friendModel.rejectFriend(db, { user_id, friend_id });

        return reply.code(200).send({
            status: true,
            message: "Friend removed successfully"
        });
        
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        
        return reply.code(statusCode).send({
            status: false,
            message: error.message
        });
    }
}

export default {
    getAllFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getPendingRequests
};