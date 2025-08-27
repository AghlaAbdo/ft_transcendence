import { getDb } from "../database/db";
import { IGameState } from "../types/game";


function postGame(gameState: IGameState):void {
    const db = getDb();
    const   query = `
    INSERT INTO Game
    (player1_id, player2_id, player1_score, player2_score, winner_id, play_time, played_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const result = db.prepare(query).run(gameState.player1_id, gameState.player2_id,
        gameState.leftPaddle.score, gameState.rightPaddle.score, gameState.winner_id, gameState.playtime, gameState.startDate);
    console.log("\nLast inserted id: ", result.lastInsertRowid, "\n");
}

export {
    postGame,
}