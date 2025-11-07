import authController from "../controllers/authController.js";
import oauthController from "../controllers/oauthController.js";

const authRoutes = async (fastify, options) => {
    // fastify.post('/signup', { schema: { body: { $ref: "signupSchema#" } } }, async (req, rep) =>{
    
    fastify.post('/signup', authController.signup);
    fastify.post('/login', authController.login);
    fastify.post('/logout', { onRequest: [fastify.authenticate] }, authController.logout);

    fastify.get('/me', { onRequest: [fastify.authenticate] }, authController.getMe);

    // 2fa routes
    fastify.get("/2fa/setup", { onRequest: [fastify.authenticate] }, authController.setup2fa);
    fastify.post("/2fa/disable",{ onRequest: [fastify.authenticate] },  authController.disable2fa);
    fastify.post("/2fa/verify", { onRequest: [fastify.authenticate] }, authController.verify2Fa);


    fastify.post('/verify-email', authController.verifyEmail);

    
    // fastify.post('/resend-verification', { 
    //     onRequest: [fastify.authenticate] 
    // }, authController.resendVerificationEmail);

    fastify.post('/resend-verification', authController.resendVerificationEmail);

    fastify.post('/forgot-password', authController.forgotPassword);
    fastify.post('/reset-password', authController.resetPassword);
    
    // fastify.post('/refresh-token'); // Refresh JWT token (requires auth)
    // fastify.post('/verify'); // Verify token validity (requires auth)

    // useful for frontend
    // fastify.get('/validate-token', { onRequest: [fastify.authenticate] }, authController.validateToken);

    // OAuth
    // --- Initiate Google OAuth Login ---
    fastify.get('/google', oauthController.initiateGoogleLogin);

    // --- Handle Google OAuth Callback --- 
    fastify.get('/google/callback',  oauthController.handleGoogleCallback);

    // // --- Route 3: Logout ---
    // fastify.post('/logout');

    //  Optional: Validate Token
    // fastify.get('/validate-token', { onRequest: [fastify.authenticate] }, authController.validateToken);

}

export default authRoutes;