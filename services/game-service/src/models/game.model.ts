import { getDb } from '../database/db';
import { IGameState } from '../types/types';

function postGame(gameState: IGameState): void {
  const db = getDb();
  const query = `
    INSERT INTO Game
    (game_type, player1_id, player2_id, player1_username, player2_username, player1_score, player2_score, winner_id, play_time, played_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  const result = db
    .prepare(query)
    .run(
      gameState.type,
      gameState.player1.id,
      gameState.player2.id,
      gameState.player1.username,
      gameState.player2.username,
      gameState.game.leftPaddle.score,
      gameState.game.rightPaddle.score,
      gameState.winner_id,
      gameState.playtime,
      gameState.startDate,
    );
  console.log('\nLast inserted id: ', result.lastInsertRowid, '\n');
}

export { postGame };
