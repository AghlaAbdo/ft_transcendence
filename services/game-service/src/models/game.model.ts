import db from "../database/db";
import { IGameState } from "../types/game";

function postGame(gameState: IGameState):void {
    const   query = `
    INSERT INTO Game
    (player1_id, player2_id, player1_score, player2_score, played_at, play_time)
    VALUES (?, ?, ?, ?, ?, ?);
    `;
    const result = db.prepare(query).run(gameState.palyer1_id, gameState.player2_id,
        gameState.leftPaddle.score, gameState.rightPaddle.score, gameState.startDate, gameState.playtime);
    console.log("\nLast inserted id: ", result.lastInsertRowid, "\n");
}

export {
    postGame,
}