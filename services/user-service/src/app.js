import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import databasePlugin from './plugins/database.js'
import fastifyCORS from '@fastify/cors';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import oauthPlugin from './plugins/oauth.js';
import userRoutes from './routes/users.js';
import friendRoutes from './routes/friends.js'
import dotenv from 'dotenv';
import multipart from "@fastify/multipart";
import fastifyStatic from '@fastify/static';
import path from "path";

const createApp = () => {
    const fastify = Fastify({
        logger: true
    });
    
    dotenv.config();

    fastify.register(multipart);

    
    fastify.register(fastifyStatic, {
        root: path.join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
    });

    fastify.register(fastifyCookie);


    fastify.register(oauthPlugin, {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    });


    fastify.register(databasePlugin);
    fastify.register(authPlugin);

    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(userRoutes, { prefix: '/api/users' });
    fastify.register(friendRoutes, { prefix: '/api/friends' });

    return fastify;
}

export default createApp;