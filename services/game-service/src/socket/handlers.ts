import { Server, Socket } from 'socket.io';
import { getCurrDate } from '../utils/dates';
import { postGame } from '../models/game.model';
import {
  generateGameState,
  paddleMoveDown,
  paddleMoveUp,
  resetGameState,
} from '../remote-game/gameState';
import { startGame, setIoInstance, deleteGame } from '../remote-game/gameLogic';
import { getAllGames, getGameState } from '../remote-game/AllGames';
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
    console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
    socket.emit('playerRole', 'player1', gameId);
    socket.join(gameId);
    allGames.lobyGame = gameId;
  } else {
    allGames.games[allGames.lobyGame].playersNb++;
    socket.join(allGames.lobyGame);
    socket.emit('playerRole', 'player2', allGames.lobyGame);
    const player = {
      username: 'user_123',
      avatar: '/avatars/avatar4.png',
      frame: 'silver3',
      level: '35',
    };
    socket.to(allGames.lobyGame).emit('matchFound', player);
    socket.emit('matchFound', player);
    const lobyGame = allGames.lobyGame;
    setTimeout(() => {
      startGame(allGames.games[lobyGame]);
    }, 3000);
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

export function handleRematch(
  socket: Socket,
  gameId: string,
  playerRole: 'player1' | 'player2' | null,
): void {
  console.log('Recived rematch!!');
  if (!playerRole) {
    console.log('playerRole is null!!');
    return;
  }
  socket.to(gameId).emit('rematch');
  const gameState = getGameState(gameId);
  if (playerRole === 'player1') gameState.player1.ready = true;
  else gameState.player2.ready = true;
  if (gameState.player1.ready && gameState.player2.ready) {
    resetGameState(gameState);
    setTimeout(() => {
      // if (!lobyGame) return;
      socket.to(gameId).emit('playAgain');
      socket.emit('playAgain');
      // socket.to(gameId).emit('startGame', gameId);
      // socket.emit('startGame', gameId);
      // gameState.startDate = getCurrDate();
      startGame(gameState);
    }, 2000);
  }
}

export function handleQuit(socket: Socket, gameId: string): void {
  console.log('revived quit event!!');
  if (!gameId) {
    console.log('gameId is Null');
    return;
  }
  const gameState = getGameState(gameId);
  socket.to(gameId).emit('opponentQuit', gameState? gameState.game.status : null);
  if (gameState)
    deleteGame(gameState);
  console.log('player quit');
}

export function handleCancelMatching(gameId: string) {
  deleteGame(getGameState(gameId));
  getAllGames().lobyGame = null;
}