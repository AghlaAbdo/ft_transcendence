import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import databasePlugin from './plugins/database.js'
import fastifyCORS from '@fastify/cors';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import oauthPlugin from './plugins/oauth.js';
import userRoutes from './routes/users.js';
import dotenv from 'dotenv';


const createApp = () => {
    const fastify = Fastify({
        logger: true
    });
    
    dotenv.config();
    
    // fastify.register(fastifyCookie);
    // Session management
    // fastify.register(fastifyCORS, {
    //     origin: ['http://localhost:3000'],  // your frontend
    //     credentials: true
    // });

    fastify.register(fastifyCookie);
    // fastify.register(fastifySession, {
    //     secret: process.env.SESSION_SECRET,
    //     cookie: {
    //     secure: process.env.NODE_ENV === 'production', // HTTPS in production
    //     httpOnly: true,
    //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
    //     }
    // });

    fastify.register(oauthPlugin, {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    });


    fastify.register(databasePlugin);
    fastify.register(authPlugin);

    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(userRoutes, { prefix: '/api/users' });

    // Health check
    fastify.get('/health', async (request, reply) => {
        reply.send({ status: 'OK', service: 'user-service', timestamp: new Date().toISOString() });
    });

    return fastify;
}

export default createApp;