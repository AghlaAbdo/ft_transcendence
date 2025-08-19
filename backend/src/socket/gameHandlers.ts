import { Server, Socket } from 'socket.io';
import {
  generateGameState,
  paddleMoveDown,
  paddleMoveUp,
} from '../game/gameState';
import { startGame, setIoInstance } from '../game/gameLogic';
import { getAllGames, getGameState } from '../game/AllGames';
import crypto from 'crypto';

export function handleConnection(socket: Socket, io: Server): void {
  socket.emit('welcome', 'Welcom to Pong Wrold');
  setIoInstance(io);
}

export function handleDisconnect(socket: Socket, reason: string): void {
  console.log('Disconnected id: ', socket.id, ' Because: ', reason);
}

export function handlePlay(socket: Socket): void {
  const allGames = getAllGames();
  if (!allGames.lobyGame) {
    const gameId = crypto.randomUUID();
    allGames.games[gameId] = generateGameState(gameId);
    socket.emit('playerRole', 'player1');
    socket.join(gameId);
    allGames.lobyGame = gameId;
  } else {
    allGames.games[allGames.lobyGame].playersNb++;
    socket.join(allGames.lobyGame);
    socket.emit('playerRole', 'player2');
    socket.to(allGames.lobyGame).emit('startGame', allGames.lobyGame);
    socket.emit('startGame', allGames.lobyGame);
    startGame(allGames.games[allGames.lobyGame]);
    allGames.lobyGame = null;
  }
}

export function handleMovePaddle(
  gameId: string,
  playerRole: string,
  dir: 'up' | 'down',
) {
  const gameState = getGameState(gameId);
  if (dir === 'up') paddleMoveUp(gameState, playerRole);
  else paddleMoveDown(gameState, playerRole);
}

export function handleGameOver(): void {
  // TODO
}
