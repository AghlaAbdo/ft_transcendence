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

  fastify.get('/games', async (req, reply) => {
    const db: DatabaseType = (fastify as any).db;
    try {
      const { userId } = req.query as { userId?: string };

      if (!userId) {
        return reply.status(400).send({ error: 'User ID is required' });
      }

      const userIdNumber = parseInt(userId, 10);
      if (isNaN(userIdNumber)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
      }

      const games = db.prepare(`
        SELECT played_at, player1_id, player2_id, 'local' as type, player1_score, player2_score, winner_id 
        FROM game 
        WHERE player1_id = ? OR player2_id = ?
        ORDER BY played_at DESC
      `).all(userIdNumber, userIdNumber);

      return { games };
    } catch {
      reply.status(500).send({ error: 'Failed to retrieve games' });
    }
  });

  fastify.get('/stats', async (req, reply) => {
    const db: DatabaseType = (fastify as any).db;
    try {
      const { userId } = req.query as { userId?: string };

      if (!userId) {
        return reply.status(400).send({ error: 'User ID is required' });
      }

      const userIdNumber = parseInt(userId, 10);
      if (isNaN(userIdNumber)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
      }

      const stats = db.prepare(`
          select sum(play_time) as total_play_time, avg(play_time) as avg_play_time, max(play_time) as longest_play_time
          from game where player1_id = ? or player2_id = ?
      `).get(userIdNumber, userIdNumber);

      return { stats };
    } catch {
      reply.status(500).send({ error: 'Failed to retrieve stats' });
    }
  });
}
