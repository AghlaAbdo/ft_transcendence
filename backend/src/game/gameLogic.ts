import { getGameState, resetGameState } from "./gameState";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, BALL_SPEED } from "../config/game";


let     ioInstance: any;
let     gameInterval: NodeJS.Timeout | null = null;
const   INTERVAL = 800 / 60;

export function setIoInstance(io: any): void {
    ioInstance = io;
}

export function startGame() {
    if (gameInterval)
        return;
    const   gameState = getGameState();
    gameState.status = 'playing';
    console.log("\nStarted the Game");
    console.log("Game state after Start: ", gameState);
    gameInterval = setInterval(()=> {
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;
        //check for top and bottom collision
        if (gameState.ball.y - BALL_RADIUS / 2 <= 0
            || gameState.ball.y + BALL_RADIUS >= GAME_HEIGHT) {
                gameState.ball.dy *= -1;
        }
        
        // if (gameState.ball.x - BALL_RADIUS / 2 <= PADDLE_WIDTH) {
        //     if (gameState.ball.y >= gameState.leftPaddle.y
        //         && gameState.ball.y <= gameState.leftPaddle.y + PADDLE_HEIGHT) {
        //             const relativeIntersectY = (gameState.leftPaddle.y + (PADDLE_HEIGHT / 2)) - gameState.ball.y;
        //             const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
        //             const bounceAngle = normalizedIntersectY * (Math.PI / 4);
        //             gameState.ball.dx = BALL_SPEED * Math.cos(bounceAngle);
        //             gameState.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
        //     }
        //     else {
        //         gameState.winner = 'player2';
        //         gameState.status = 'ended';
        //         ioInstance.emit('gameOver', 'player2');
        //         stopGame();
        //     }
        // }

        // check collision with left paddle
        if (gameState.ball.x - BALL_RADIUS / 2 <= PADDLE_WIDTH
            && (gameState.ball.y >= gameState.leftPaddle.y
            && gameState.ball.y <= gameState.leftPaddle.y + PADDLE_HEIGHT)) {
                const relativeIntersectY = (gameState.leftPaddle.y + (PADDLE_HEIGHT / 2)) - gameState.ball.y;
                const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
                const bounceAngle = normalizedIntersectY * (Math.PI / 4);
                gameState.ball.dx = BALL_SPEED * Math.cos(bounceAngle);
                gameState.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
        }
        // check collision with right paddle
        else if (gameState.ball.x + BALL_RADIUS / 2 >= GAME_WIDTH - PADDLE_WIDTH
            && (gameState.ball.y >= gameState.rightPaddle.y
            && gameState.ball.y <= gameState.rightPaddle.y + PADDLE_HEIGHT)) {
                const relativeIntersectY = (gameState.rightPaddle.y + (PADDLE_HEIGHT / 2)) - gameState.ball.y;
                const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
                const bounceAngle = normalizedIntersectY * (Math.PI / 4);
                gameState.ball.dx = -BALL_SPEED * Math.cos(bounceAngle);
                gameState.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
        }
        // check for loss
        else if (gameState.ball.x - 10 <= 0) {
            gameState.winner = 'player2';
            gameState.status = 'ended';
            ioInstance.emit('gameOver', 'player2');
            stopGame();
        }
        else if (gameState.ball.x + 10 >= GAME_WIDTH) {
            gameState.winner = 'player1';
            gameState.status = 'ended';
            ioInstance.emit('gameOver', 'player1');
            stopGame();
        }
        

        ioInstance.emit('gameStateUpdate', gameState);
    }, INTERVAL);
}

function stopGame(): void {
    if (gameInterval)
        clearInterval(gameInterval);
    gameInterval = null;
    resetGameState();
}
