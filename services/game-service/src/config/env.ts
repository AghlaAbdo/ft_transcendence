import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'dataBase';
const FASTIFY_PORT = parseInt(process.env.FASTIFY_PORT || '4000');
const SOCKETIO_PORT = parseInt(process.env.SOCKETIO_PORT || '4040');

export { DB_NAME, FASTIFY_PORT, SOCKETIO_PORT };
