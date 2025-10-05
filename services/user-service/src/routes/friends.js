import friendController from "../controllers/friendController.js";

const friendRoutes = (fastify, options) => {

    fastify.get("/", {
        onRequest: [fastify.authenticate] 
    }, friendController.getAllFriends);
    
    fastify.get("/pending", {
        onRequest: [fastify.authenticate] 
    }, friendController.getPendingRequests);

    
    fastify.post("/request", {
        onRequest: [fastify.authenticate] 
    }, friendController.sendFriendRequest);


    fastify.post("/accept/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.acceptFriendRequest);


    fastify.post("/reject/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.rejectFriendRequest);


    fastify.post("/remove/:id", {
        onRequest: [fastify.authenticate] 
    }, friendController.removeFriendRequest);



    // fastify.post("/friends/send", { onRequest: [fastify.authenticate] }, friendController.sendFriendRequest);
    // fastify.post("/friends/accept", { onRequest: [fastify.authenticate] }, friendController.acceptFriendRequest);
    // fastify.post("/friends/reject", { onRequest: [fastify.authenticate] }, friendController.rejectFriendRequest);
    // fastify.delete("/friends/remove", { onRequest: [fastify.authenticate] }, friendController.removeFriend);
    // fastify.get("/friends", { onRequest: [fastify.authenticate] }, friendController.getAllFriends);
    // fastify.get("/friends/requests", { onRequest: [fastify.authenticate] }, friendController.getFriendRequests);

}

export default friendRoutes;