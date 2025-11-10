import authController from "../controllers/authController.js";
import oauthController from "../controllers/oauthController.js";

const authRoutes = async (fastify, options) => {
    
    fastify.post('/signup', authController.signup);
    fastify.post('/login', authController.login);
    fastify.post('/logout', { onRequest: [fastify.authenticate] }, authController.logout);

    fastify.get('/me', { onRequest: [fastify.authenticate] }, authController.getMe);

    fastify.post('/verify-email', authController.verifyEmail);

    fastify.post('/resend-verification', authController.resendVerificationEmail);

    fastify.post('/forgot-password', authController.forgotPassword);
    fastify.post('/reset-password', authController.resetPassword);
    

    fastify.get('/google', oauthController.initiateGoogleLogin);

    fastify.get('/google/callback',  oauthController.handleGoogleCallback);

}

export default authRoutes;