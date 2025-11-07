import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';
import cookie from 'cookie'
import { JWT_SECRET } from '../config/env';


export default async function authorization(request: FastifyRequest, reply: FastifyReply) {
  try {
    const cookies = cookie.parse(request.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return reply.code(401).send({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as  { id: string; username: string };
    // console.log(" -- Decoded: ", decoded);
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
}