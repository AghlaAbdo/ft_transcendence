import { IGameState } from "../types/game";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED, BALL_RADIUS } from "../config/game";

let gameState: IGameState = {
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 5, dy: 5, radius: BALL_RADIUS },
    paddle1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    paddle2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    status: 'waiting',
    players: {},
    playersNb: 0
};

export function getGameState(): IGameState {
    return gameState;
}

export function paddleMoveUp(playerRole: string): void {
    console.log("Move Up, Player Role: ", playerRole);
    if (playerRole === 'player1') {
        if (gameState.paddle1.y - PADDLE_SPEED > 0)
            gameState.paddle1.y -= PADDLE_SPEED;
    }
    else {
        if (gameState.paddle2.y - PADDLE_SPEED > 0)
            gameState.paddle2.y -= PADDLE_SPEED;
    }
}

export function paddleMoveDown(playerRole: string): void {
    console.log("Move Down, Player Role: ", playerRole);
    if (playerRole === 'player1') {
        if (gameState.paddle1.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.paddle1.y += PADDLE_SPEED;
    }
    else {
        if (gameState.paddle2.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.paddle2.y += PADDLE_SPEED;
    }
}
