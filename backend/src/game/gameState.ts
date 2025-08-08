import { IGameState } from "../types/game";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED, BALL_RADIUS, BALL_SPEED } from "../config/game";

let gameState: IGameState = {
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED, radius: BALL_RADIUS },
    leftPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    rightPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    status: 'waiting',
    players: {plr1Socket: null, plr2Socket: null},
    playersNb: 0,
    winner: null,
};

export function getGameState(): IGameState {
    return gameState;
}

export function paddleMoveUp(playerRole: string): void {
    console.log("Move Up, Player Role: ", playerRole);
    if (playerRole === 'player1') {
        if (gameState.leftPaddle.y - PADDLE_SPEED > 0)
            gameState.leftPaddle.y -= PADDLE_SPEED;
    }
    else {
        if (gameState.rightPaddle.y - PADDLE_SPEED > 0)
            gameState.rightPaddle.y -= PADDLE_SPEED;
    }
}

export function paddleMoveDown(playerRole: string): void {
    console.log("Move Down, Player Role: ", playerRole);
    if (playerRole === 'player1') {
        if (gameState.leftPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.leftPaddle.y += PADDLE_SPEED;
    }
    else {
        if (gameState.rightPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.rightPaddle.y += PADDLE_SPEED;
    }
}

export function resetGameState(): void {
    // gameState.ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 5, dy: 5, radius: BALL_RADIUS };
    // gameState.leftPaddle = { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 };
    // gameState.rightPaddle = { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 };
    // gameState.status = 'waiting';
    // gameState.players = {plr1Socket: null, plr2Socket: null};
    // gameState.playersNb = 0;
    // gameState.winner = null;

    gameState = {
        ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED, radius: BALL_RADIUS },
        leftPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
        rightPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
        status: 'waiting',
        players: {plr1Socket: null, plr2Socket: null},
        playersNb: 0,
        winner: null,
    };
}
