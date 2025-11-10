import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'pingpongsupersecretkey123';
const COOKIE_NAME: string = 'token';
// forward to /api/auth/message
const authPlugin = async (fastify: any, options: any) => {
    // console.log('options: ', options
    // );
    
    // console.log('midlwaaaare');
    // fastify.decorate('signToken', (payload: any) => {
    //     return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
    // });

    // // Decorate Fastify with cookie setting method
    // fastify.decorate('setAuthCookie', (reply: any, token: string) => {
    //     reply.setCookie(COOKIE_NAME, token, {
    //         path: '/',
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production', //local: http , production: https
    //         sameSite: 'strict', // CSRF protection  // sameSite: 'lax'
    //         maxAge: 7 * 24 * 60 * 60 // 7 days 
    //     });
    // });

    // fastify.decorate('clearAuthCookie', (reply: any) => {
    //     reply.clearCookie(COOKIE_NAME, {
    //         path: '/',
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: 'strict'
    //     });
    // });

    fastify.decorate('authenticate', async (request: any, reply: any) => {
        console.log('allo forom auth');
        const token = request.cookies[COOKIE_NAME];
        console.log('cookie:', token);

        try {
            if (!token) {
                return reply.code(401).send({ 
                    status: false, 
                    message: 'Unauthorized - no token provided'
                });
            }

            const response = await fetch('http://user-service:5000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Cookie': `${COOKIE_NAME}=${token}`,
                    'Content-Type': 'application/json'
                }

            });
            if (!response.ok) {
                fastify.clearAuthCookie(reply);
                return reply.code(401).send({ 
                    status: false, 
                    message: 'Unauthorized - Invalid or expired token'
                });
            }

            const userData = await response.json();
            
            if (!userData || !userData.user) {
                fastify.clearAuthCookie(reply);
                return reply.code(401).send({ 
                    status: false, 
                    message: 'User not found'
                });
            }
            request.user = userData.user;

        } catch (error: any) {
            console.error('Authentication error:', error);
            // fastify.clearAuthCookie(reply);
            return reply.code(401).send({
                status: false, 
                error: error.message, 
                message: 'Unauthorized: Authentication failed'
            });
        }
    });

    fastify.log.info('Cookie-based authentication plugin registered')
};

export default fp(authPlugin, {
    name: 'auth'
});