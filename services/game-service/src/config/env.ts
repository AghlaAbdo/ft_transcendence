import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'dataBase';
const FASTIFY_PORT = parseInt(process.env.FASTIFY_PORT || '4000');
const SOCKETIO_PORT = parseInt(process.env.SOCKETIO_PORT || '4040');
const USER_SERVICE_HOST =
  process.env.USER_SERVICE_HOST || 'http://user-service:5000';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'supersecretkey123'

export { DB_NAME, FASTIFY_PORT, SOCKETIO_PORT, USER_SERVICE_HOST, INTERNAL_API_KEY };
