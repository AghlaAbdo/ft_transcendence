import { FastifyInstance } from 'fastify';
import { Database as DatabaseType } from 'better-sqlite3';

export default async function apiRouter(fastify: FastifyInstance, ops: any) {
  fastify.get('/matches', async (req, reply) => {
    const db: DatabaseType = (fastify as any).db;
    try {
      const matches = db
        .prepare('SELECT * FROM Game ORDER BY played_at DESC')
        .all();
      return { matches };
    } catch {
      reply.status(500).send({ error: 'Failed to retrieve matches' });
    }
  });
}
