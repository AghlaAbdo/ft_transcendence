import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pingpongsupersecretkey123';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'pingpongsupersecretkey';
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
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // More permissive for dev, strict for prod
            maxAge: 7 * 24 * 60 * 60, // 7 days 
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Explicit domain for dev
        });
    });

    fastify.decorate('clearAuthCookie', (reply) => {
        reply.clearCookie(COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
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

            const user = fastify.db.prepare(`
                SELECT id, username, email,avatar_url,
                isAccountVerified, points, wins, losses, level, is_google_auth, 
                online_status, is_2fa_enabled, createdAt, updatedAt FROM USERS WHERE id = ?`
            ).get(decoded.id);
            
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

    fastify.decorate('verifyInternalRequest', async (request, reply) => {
        const internalKey = request.headers['x-internal-key'];
        
        if (!internalKey || internalKey !== INTERNAL_SECRET) {
            return reply.status(403).send({
                status: false,
                message: 'Forbidden: Invalid internal key',
            });
        }
    });

    fastify.log.info('Cookie-based authentication plugin registered')
};

export default fp(authPlugin, {
    name: 'auth'
});