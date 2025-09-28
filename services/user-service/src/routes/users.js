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
        // console.log('user service backend request')
    }, userController.getUserById); 
    fastify.get('/',{ 
        // onRequest: [fastify.authenticate] 
    },  userController.getAllUsers); 
}

export default userRoutes;