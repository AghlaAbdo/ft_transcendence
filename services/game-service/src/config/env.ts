import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'game.db';
const FASTIFY_PORT = parseInt(process.env.FASTIFY_PORT || '4000');
const SOCKETIO_PORT = parseInt(process.env.SOCKETIO_PORT || '4040');
const USER_SERVICE_HOST =
  process.env.USER_SERVICE_HOST || 'http://user-service:5000';
const JWT_SECRET = process.env.JWT_SECRET;

const INTERNAL_API_KEY: string | undefined = process.env.INTERNAL_API_KEY;

export function checkEnv() {
  if (!JWT_SECRET || !INTERNAL_API_KEY) {
    console.error('Messing envirenment variables:');
    process.exit('Messing envirenment variables');
  }
}

export {
  DB_NAME,
  FASTIFY_PORT,
  SOCKETIO_PORT,
  USER_SERVICE_HOST,
  INTERNAL_API_KEY,
  JWT_SECRET,
};
