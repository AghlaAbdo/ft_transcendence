import { getGameState } from "./gameState";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/game";


let     ioInstance: any;
let     gameInterval: NodeJS.Timeout | null = null;
const   INTERVAL = 500 / 60;
const   gameState = getGameState();

export function setIoInstance(io: any): void {
    ioInstance = io;
}

export function startGame() {
    if (gameInterval)
        return;
    gameState.status = 'playing';
    console.log("\nStarted the Game");
    gameInterval = setInterval(()=> {
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;
        
        if (gameState.ball.y - 10 <= 0 || gameState.ball.y + 10 >= GAME_HEIGHT) {
            gameState.ball.dy *= -1;
        }
        if (gameState.ball.x - 10 <= 0 || gameState.ball.x + 10 >= GAME_WIDTH) {
            gameState.ball.dx *= -1;
            
        }
        ioInstance.emit('gameStateUpdate', gameState);
    }, INTERVAL);
}
