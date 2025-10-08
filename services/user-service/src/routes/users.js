import userController from "../controllers/userController.js";

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
}

export default userRoutes;