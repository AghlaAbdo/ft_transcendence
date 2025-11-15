import fp from 'fastify-plugin';
import {config} from "../config/env.js"

// const JWT_SECRET: string | null = process.env.JWT_SECRET;
const COOKIE_NAME: string = 'token';

const authPlugin = async (fastify: any, options: any) => {

    fastify.decorate('authenticate', async (request: any, reply: any) => {
        
        const token = request.cookies[COOKIE_NAME];

        try {
            if (!token) {
                return reply.code(401).send({ 
                    status: false, 
                    message: 'Unauthorized - no token provided'
                });
            }
            
            const response = await fetch(`${config.userServiceUrl}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Cookie': `${COOKIE_NAME}=${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                return reply.code(401).send({ 
                    status: false, 
                    message: 'Unauthorized - Invalid or expired token'
                });
            }
            
            const userData = await response.json();
            
            if (!userData || !userData.user) {
                return reply.code(400).send({ 
                    status: false, 
                    message: 'User not found'
                });
            }
            request.user = userData.user;

        } catch (error: any) {
            return reply.code(400).send({
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