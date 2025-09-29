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

export function handlePlay(socket: Socket, userId: string | null): void {
  console.log("user id: ", userId);
  const allGames = getAllGames();

  const player1 = {
    username: 'user_123',
    avatar: '/avatars/avatar1.png',
    frame: 'sapphire3',
    level: '47',
  };
  const player2 = {
    username: 'user_456',
    avatar: '/avatars/avatar2.png',
    frame: 'gold2',
    level: '145',
  };

  if (!allGames.lobyGame) {
    const gameId = crypto.randomUUID();
    allGames.games[gameId] = generateGameState(gameId);
    console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
    socket.emit('playerData', {playerRole: 'player1',gameId, player: player1});
    socket.join(gameId);
    allGames.lobyGame = gameId;
  } else {
    allGames.games[allGames.lobyGame].playersNb++;
    socket.join(allGames.lobyGame);
    socket.emit('playerData', {playerRole: 'player2', gameId: allGames.lobyGame, player: player2});
    socket.to(allGames.lobyGame).emit('matchFound', player2);
    socket.emit('matchFound', player1);
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