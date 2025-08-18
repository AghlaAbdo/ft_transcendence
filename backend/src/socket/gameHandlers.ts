import { Server, Socket } from 'socket.io';
import {
  GenerateGameState,
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
  // const gameState: IGameState = getGameState();
  // if (gameState.playersNb + 1 > 2)
  //     return;
  // gameState.playersNb++;
  // if (gameState.playersNb === 1) {
  //     socket.emit('playerRole', 'player1');
  // }
  // else {
  //     socket.emit('playerRole', 'player2');
  //     startGame();
  // }

  const allGames = getAllGames();
  if (!allGames.lobyGame) {
    const gameId = crypto.randomUUID();
    allGames.games[gameId] = GenerateGameState(gameId);
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

// export function handleMoveUp(playerRole: string): void {
//     paddleMoveUp(playerRole);
// }

// export function handleMoveDown(playerRole: string): void {
//     paddleMoveDown(playerRole);
// }

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
