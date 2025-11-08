import { FastifyInstance } from 'fastify';
import { Database as DatabaseType } from 'better-sqlite3';
import { getPlayerInfo } from '../utils/getPlayerInfo';
import { handleGameInvite } from '../remote-game/gameInvite';
import authorization from './auth';
import { logEvent } from '../server';

export interface WeekStats {
  week_number: number;
  games_played: number;
}

export default async function apiRouter(fastify: FastifyInstance, ops: any) {
  fastify.addHook('preHandler', authorization);

  fastify.get('/matches', async (req, reply) => {
    logEvent('info', 'game', 'api_request', {
      method: 'GET',
      path: '/matches',
    });
    const db: DatabaseType = (fastify as any).db;
    try {
      const matches = db
        .prepare('SELECT * FROM game ORDER BY played_at DESC')
        .all();
      return { matches };
    } catch (error) {
      console.error('Error retrieving matches:', error);
      reply.status(500).send({ error: 'Failed to retrieve matches' });
    }
  });

  fastify.get('/games', async (req, reply) => {
    logEvent('info', 'game', 'api_request', { method: 'GET', path: '/games' });
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

      const games = db
        .prepare(
          `
        SELECT played_at, player1_id, player2_id, 'local' as type, player1_score, player2_score, winner_id 
        FROM game 
        WHERE player1_id = ? OR player2_id = ?
        ORDER BY played_at DESC
      `,
        )
        .all(userIdNumber, userIdNumber);

      return { games };
    } catch (error) {
      console.error('Error retrieving games:', error);
      reply.status(500).send({ error: 'Failed to retrieve games' });
    }
  });

  fastify.get('/stats', async (req, reply) => {
    logEvent('info', 'game', 'api_request', { method: 'GET', path: '/stats' });
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

      const stats = db
        .prepare(
          `
          select sum(play_time) as total_play_time, avg(play_time) as avg_play_time, max(play_time) as longest_play_time
          from game where player1_id = ? or player2_id = ?
      `,
        )
        .get(userIdNumber, userIdNumber);

      return { stats };
    } catch (error) {
      console.error('Error retrieving stats:', error);
      reply.status(500).send({ error: 'Failed to retrieve stats' });
    }
  });

  fastify.get('/weekly_stats', async (req, reply) => {
    logEvent('info', 'game', 'api_request', {
      method: 'GET',
      path: '/weekly_stats',
    });
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

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      // const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const daysInMonth = monthEnd.getDate();
      const quarterSize = Math.ceil(daysInMonth / 4);
      const weeks = [
        { week: 1, start: 1, end: quarterSize },
        { week: 2, start: quarterSize + 1, end: quarterSize * 2 },
        { week: 3, start: quarterSize * 2 + 1, end: quarterSize * 3 },
        { week: 4, start: quarterSize * 3 + 1, end: daysInMonth },
      ];

      const stmt = db.prepare(`
        SELECT
          CASE 
            WHEN CAST(strftime('%d', played_at) AS INTEGER) BETWEEN ? AND ? THEN 1
            WHEN CAST(strftime('%d', played_at) AS INTEGER) BETWEEN ? AND ? THEN 2
            WHEN CAST(strftime('%d', played_at) AS INTEGER) BETWEEN ? AND ? THEN 3
            WHEN CAST(strftime('%d', played_at) AS INTEGER) BETWEEN ? AND ? THEN 4
          END as week_number,
          COUNT(*) AS games_played
        FROM game
        WHERE (player1_id = ? OR player2_id = ?)
          AND strftime('%Y-%m', played_at) = ?
          AND week_number IS NOT NULL
        GROUP BY week_number
        ORDER BY week_number
      `);

      const dbResults = stmt.all(
        weeks[0].start,
        weeks[0].end,
        weeks[1].start,
        weeks[1].end,
        weeks[2].start,
        weeks[2].end,
        weeks[3].start,
        weeks[3].end,
        userIdNumber,
        userIdNumber,
        `${year}-${String(month + 1).padStart(2, '0')}`,
      ) as WeekStats[];

      const stats = [1, 2, 3, 4].map((weekNum) => {
        const found = dbResults.find((r) => r.week_number === weekNum);
        // const weekInfo = weeks.find(w => w.week === weekNum);
        return {
          week: weekNum,
          games_played: found ? found.games_played : 0,
          // range: weekInfo ? `${year}-${String(month + 1).padStart(2, '0')}-${String(weekInfo.start).padStart(2, '0')} to ${year}-${String(month + 1).padStart(2, '0')}-${String(weekInfo.end).padStart(2, '0')}` : null
        };
      });

      return { stats };
    } catch (error) {
      console.error('Error retrieving weekly stats:', error);
      reply.status(500).send({ error: 'Failed to retrieve weekly stats' });
    }
  });

  fastify.post('/game-invite', async (req, rep) => {
    logEvent('info', 'game', 'api_request', {
      method: 'POST',
      path: '/game-invite',
    });
    console.log('req.body: ', req.body);
    console.log('req.query: ', req.query);
    const { challengerId, opponentId } = req.query as {
      challengerId?: string;
      opponentId?: string;
    };
    if (!challengerId || !opponentId || challengerId === opponentId) {
      rep
        .status(500)
        .send({ error: 'challengerId and opponentId are required!' });
      return;
    }
    const challenger = await getPlayerInfo(challengerId);
    const opponent = await getPlayerInfo(opponentId);
    // console.log("challenger: ", challenger);
    // console.log("opponent: ", opponent);
    if (!challenger || !opponent) {
      rep.status(500).send({ error: 'Players not found!' });
      return;
    }
    const gameId = handleGameInvite(challenger, opponent);
    return { message: 'Created game!', gameId };
  });
}
