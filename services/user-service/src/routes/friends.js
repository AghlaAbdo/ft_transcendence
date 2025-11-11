import friendController from "../controllers/friendController.js";

const friendRoutes = (fastify, options) => {

    // fastify.get("/", {
    //     onRequest: [fastify.authenticate] 
    // }, friendController.getAllFriends);


    fastify.get("/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.getAllFriends);

    fastify.get("/friend_data/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.getFriendData);

    fastify.get("/friend_data_backend/:userid/:friendid", {
        // onRequest: [fastify.verifyInternalRequest] 
    }, friendController.getFriendData_backend);
    
    fastify.get("/pending", {
        onRequest: [fastify.authenticate] 
    }, friendController.getPendingRequests);

    
    fastify.post("/request", {
        onRequest: [fastify.authenticate] 
    }, friendController.sendFriendRequest);


    fastify.put("/accept/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.acceptFriendRequest);

    fastify.post("/unblock", {
        // onRequest: [fastify.authenticate]
    }, friendController.unblockFriend);


    fastify.post("/block", {
        // onRequest: [fastify.authenticate]
    }, friendController.blockFriend);


    fastify.delete("/reject/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.rejectFriendRequest);


    fastify.delete("/remove/:friend_id", {
        onRequest: [fastify.authenticate] 
    }, friendController.removeFriend);


    fastify.get("/:id/search", {
        onRequest: [fastify.authenticate] 
    }, friendController.searchQuery);

}

export default friendRoutes;