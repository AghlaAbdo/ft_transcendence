import userController from "../controllers/userController.js";
import notoficationModel from "../models/notoficationModel.js";

const userRoutes = async (fastify, options) => {
    
    fastify.get('/profile', { 
        onRequest: [fastify.authenticate] 
    }, userController.getProfile);
    fastify.put('/profile', { 
        onRequest: [fastify.authenticate] 
    }, userController.updateProfile); 
    fastify.delete('/account', { 
        onRequest: [fastify.authenticate] 
    }, userController.deleteAccount); 

    // fastify.post('/change-password');
    // fastify.post('/forgot-password'); // auth 
    
    fastify.get('/:id', { 
        // onRequest: [fastify.authenticate] 
    }, userController.getUserById); 
    
    fastify.get('/',{ 
        // onRequest: [fastify.authenticate] 
    },  userController.getAllUsers); 


    fastify.post('/upload-avatar', {
        onRequest: [fastify.authenticate]
    }, userController.uploadAvatar);


    fastify.post('/change-password', {
        onRequest: [fastify.authenticate]
    }, userController.changePassword);

    fastify.post('/update-info', {
        onRequest: [fastify.authenticate]
    }, userController.updateInfo);


    fastify.put('/2fa', {
        onRequest: [fastify.authenticate]
    }, userController.twoFactorAuth);

    fastify.get('/search', {
      onRequest: [fastify.authenticate]
    }, userController.searchQuery);

    fastify.post('/update-stats', userController.updateStats);

    fastify.get("/notifications/:userId", {
        onRequest: [fastify.authenticate]
      },
      async (req, reply) => {
      
      const userId = parseInt((req.params).userId);
      if (isNaN(userId)) 
        return reply.status(400).send({ error: "Invalid userId" });
    
      try {
        const db = req.server.db;
        return  notoficationModel.getnotifications(db, userId);
      } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Failed to fetch notifications" });
      }
    });
    
    fastify.put('/notifications/friend_request/mark-as-read', {
        onRequest: [fastify.authenticate]
      }, async (req, res) => {
      
      const {userId} =  req.body;
      const db = req.server.db;
      console.log('user: ', userId);
      
      return notoficationModel.mark_friend_request_as_read(db, userId ,  "friend_request");
    });
    
    
    fastify.put('/notifications/game/mark-as-read',{
        onRequest: [fastify.authenticate]
      }, async (req, res) => {
      const {userId} =  req.body;
      const db = req.server.db;

      return notoficationModel.mark_friend_request_as_read(db, userId, "game_invite");
    });

    fastify.post("/heartbeat", {
      onRequest: fastify.authenticate
    }, userController.heartBeat);
}

export default userRoutes;