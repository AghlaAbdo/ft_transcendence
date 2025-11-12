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
import fs from 'fs';

const logStream = fs.createWriteStream('./logs/user.log', { flags: 'a' });

export function logEvent(level, service, event, data = {}) {
    const logger = global.userServiceLogger;
    if (logger && logger[level] && typeof logger[level] === 'function') {
        logger[level]({
            service,
            event,
            ...data,
        });
    } else {
        console.warn(`Invalid log level: ${level}`);
    }
}

const createApp = () => {
    const fastify = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
            stream: logStream,
            base: null,
            timestamp: () => `,"time":"${new Date().toISOString()}"`
        }
    });

    dotenv.config();

    fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        }
    });


    fastify.register(fastifyStatic, {
        root: path.join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
    });

    fastify.register(fastifyCookie);

    // Register session plugin - CRITICAL for session persistence
    fastify.register(fastifySession, {
        secret: process.env.SESSION_SECRET || 'WvWBL9ZdBBYAAztIRYYNAdgeUz1igece2iISjaMYkSA0EHQdzyFSFbv4',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        }
    });

    fastify.addHook('onRequest', async (request, reply) => {
            logEvent('info', 'user', 'api_request', {
                method: request.method,
                path: request.url,
            });
    });


    fastify.register(oauthPlugin, {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    });


    fastify.register(databasePlugin);
    fastify.register(authPlugin);

    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(userRoutes, { prefix: '/api/users' });
    fastify.register(friendRoutes, { prefix: '/api/friends' });

    global.userServiceLogger = fastify.log;

    return fastify;
}

export default createApp;