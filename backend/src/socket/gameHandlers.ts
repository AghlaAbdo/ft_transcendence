import { Socket } from 'socket.io';
import { getGameState, paddleMoveDown, paddleMoveUp } from '../game/gameState';
import { IGameState } from '../types/game';
import { startGame, setIoInstance } from '../game/gameLogic';

export function handleConnection(socket: Socket, io: any): void {
    socket.emit('welcome', "Welcom to Pong Wrold");
    setIoInstance(io);
}

export function handleDisconnect(socket: Socket, reason: string): void {
    console.log ("Disconnected id: ", socket.id, " Because: ", reason);
}

export function handlePlay(socket: Socket): void {
    const gameState: IGameState = getGameState();
    if (gameState.playersNb + 1 > 2)
        return;
    gameState.playersNb++;
    if (gameState.playersNb === 1) {
        socket.emit('playerRole', 'player1');
    }
    else {
        socket.emit('playerRole', 'player2');
        startGame();
    }
}

export function handleMoveUp(playerRole: string): void {
    paddleMoveUp(playerRole);
}

export function handleMoveDown(playerRole: string): void {
    paddleMoveDown(playerRole);
}

export function handleGameOver(): void {
    // TODO
}
