import { IGameState } from "../types/game";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED, BALL_RADIUS, BALL_SPEED } from "../config/game";

const direction = Math.random() < 0.5 ? 1 : -1;
const angle =(Math.random() * (Math.PI / 2)) - (Math.PI / 4);
let gameState: IGameState = {
    ball: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        dx: (BALL_SPEED * Math.cos(angle)) * direction,
        dy: BALL_SPEED * Math.sin(angle),
        dir: direction,
        radius: BALL_RADIUS
    },
    leftPaddle: {
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        score: 0
    },
    rightPaddle: {
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        score: 0
    },
    status: 'waiting',
    players: {plr1Socket: null, plr2Socket: null},
    playersNb: 0,
    winner: null,
};

export function getGameState(): IGameState {
    return gameState;
}

export function paddleMoveUp(playerRole: string): void {
    // console.log("Move Up, Player Role: ", playerRole);
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
    // console.log("Move Down, Player Role: ", playerRole);
    if (playerRole === 'player1') {
        if (gameState.leftPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.leftPaddle.y += PADDLE_SPEED;
    }
    else {
        if (gameState.rightPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
            gameState.rightPaddle.y += PADDLE_SPEED;
    }
}

export function resetBallPos():void {
    const angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
    gameState.ball = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        dx: BALL_SPEED * Math.cos(angle),
        dy: BALL_SPEED * Math.sin(angle),
        dir: gameState.ball.dir * -1,
        radius: BALL_RADIUS
    };
    gameState.ball.dx *= gameState.ball.dir;
}

export function resetGameState(): void {
    const angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
    const direction = (Math.random() < 0.5 ? 1 : -1);
    gameState = {
        ball: {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            dx: (BALL_SPEED * Math.cos(angle)) * direction,
            dy: BALL_SPEED * Math.sin(angle),
            dir: direction,
            radius: BALL_RADIUS
        },
        leftPaddle: {
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            height: PADDLE_HEIGHT,
            width: PADDLE_WIDTH,
            score: 0
        },
        rightPaddle: {
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            height: PADDLE_HEIGHT,
            width: PADDLE_WIDTH,
            score: 0
        },
        status: 'waiting',
        players: {plr1Socket: null, plr2Socket: null},
        playersNb: 0,
        winner: null,
    };
}
