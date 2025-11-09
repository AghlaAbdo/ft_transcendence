import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pingpongsupersecretkey123';
const COOKIE_NAME = 'token';

const authPlugin = async (fastify, options) => {

    fastify.decorate('signToken', (payload) => {
        return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
    });

    // Decorate Fastify with cookie setting method
    fastify.decorate('setAuthCookie', (reply, token) => {
        reply.setCookie(COOKIE_NAME, token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //local: http , production: https
            sameSite: 'strict', // CSRF protection  // sameSite: 'lax'
            maxAge: 7 * 24 * 60 * 60 // 7 days 
        });
    });

    fastify.decorate('clearAuthCookie', (reply) => {
        reply.clearCookie(COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    });

    // Decorate Fastify with authentication middleware
    fastify.decorate('authenticate', async (request, reply ) => {
        const token = request.cookies[COOKIE_NAME];

        try {
            if (!token)
                return reply.code(401).send({ status: false, message: 'Unauthorized - no token provided'});

            const decoded = jwt.verify(token, JWT_SECRET);
            if (!decoded)
                return reply.code(401).send({ status: false, message: 'Unauthorized - Invalid token'});

            console.log('current user for logged up--->; ', decoded);

            const user = fastify.db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
            if (!user) {
                fastify.clearAuthCookie(reply);
                return reply.code(401).send({ status: false, message: 'User no longer exists' });
            }

            request.user = user;


        } catch (error) {
            fastify.clearAuthCookie(reply);
            reply.code(401).send({status:'false', error: error.message, message: 'Unauthorized: Authentication failed'});
        }
    });

    fastify.log.info('Cookie-based authentication plugin registered')
};

export default fp(authPlugin, {
    name: 'auth'
});