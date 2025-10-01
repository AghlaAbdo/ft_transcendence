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
import {
  getUserActiveGame,
  setUserActiveGame,
  removeUserActiveGame,
} from '../remote-game/userActiveGame';
import { fetchUser } from '../api/userService';
import { getPlayerInfo } from '../utils/getPlayerInfo';

let ioInstance: Server;

export function handleConnection(socket: Socket, io: Server): void {
  socket.emit('welcome', 'Welcom to Pong Wrold');
  setIoInstance(io);
  ioInstance = io;
}

export function handleDisconnect(socket: Socket, reason: string): void {
  console.log('Disconnected id: ', socket.id, ' Because: ', reason);
  const allGames = getAllGames();

  const gameToQuit = Object.values(allGames.games).find(
    (game) =>
      game.player1.socketId === socket.id ||
      game.player2.socketId === socket.id,
  );

  if (gameToQuit) {
    const quitterRole =
      gameToQuit.player1.socketId === socket.id ? 'player1' : 'player2';
    const opponentRole = quitterRole === 'player1' ? 'player2' : 'player1';

    gameToQuit.game.winner = opponentRole;

    const opponentSocketId =
      opponentRole === 'player1'
        ? gameToQuit.player1.socketId
        : gameToQuit.player2.socketId;

    if (opponentSocketId) {
      console.log('sent opponentQuit event!!');
      console.log('game.status: ', gameToQuit.game.status);
      ioInstance.to(opponentSocketId).emit('prepare');
      const gameStatus = gameToQuit.game.status;
      if (gameStatus === 'waiting') {
        setTimeout(() => {
          ioInstance.to(opponentSocketId).emit('opponentQuit', gameStatus);
        }, 1000);
      } else ioInstance.to(opponentSocketId).emit('opponentQuit', gameStatus);
    }
    gameToQuit.game.status = 'ended';
    removeUserActiveGame(gameToQuit.player1.id);
    removeUserActiveGame(gameToQuit.player2.id);
    deleteGame(gameToQuit);

    if (allGames.lobyGame === gameToQuit.id) {
      allGames.lobyGame = null;
    }
  }
}

export async function handlePlay(socket: Socket, userId: string) {
  const user = await getPlayerInfo(userId);
  // console.log("user id: ", userId);
  // console.log("user: ", user);

  if (!user) return;
  if (getUserActiveGame(userId)) {
    socket.emit('inAnotherGame');
    return;
  }

  const allGames = getAllGames();
  console.log('allGamges length: ', Object.keys(allGames.games).length);

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
    allGames.games[gameId] = generateGameState(gameId, user, socket.id);
    console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
    socket.emit('playerData', {
      playerRole: 'player1',
      gameId,
      player: player1,
    });
    socket.join(gameId);
    allGames.lobyGame = gameId;
    setUserActiveGame(userId, gameId);
  } else {
    allGames.games[allGames.lobyGame].playersNb++;
    allGames.games[allGames.lobyGame].player2.id = user.id;
    allGames.games[allGames.lobyGame].player2.username = user.username;
    allGames.games[allGames.lobyGame].player2.avatar = user.avatar;
    allGames.games[allGames.lobyGame].player2.frame = user.frame;
    allGames.games[allGames.lobyGame].player2.level = user.level;
    allGames.games[allGames.lobyGame].player2.socketId = socket.id;
    socket.join(allGames.lobyGame);
    socket.emit('playerData', {
      playerRole: 'player2',
      gameId: allGames.lobyGame,
      player: player2,
    });
    socket
      .to(allGames.lobyGame)
      .emit('matchFound', allGames.games[allGames.lobyGame].player2);
    socket.emit('matchFound', allGames.games[allGames.lobyGame].player1);
    const lobyGame = allGames.lobyGame;
    setTimeout(() => {
      startGame(allGames.games[lobyGame]);
    }, 3000);
    allGames.lobyGame = null;
    setUserActiveGame(userId, allGames.lobyGame!);
  }
}

export function handleMovePaddle(
  gameId: string,
  playerRole: string,
  dir: 'up' | 'down',
) {
  const gameState = getGameState(gameId);
  if (!gameState) return;
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
  const gameState = getGameState(gameId);
  if (!gameState) return;
  socket.to(gameId).emit('rematch');
  if (playerRole === 'player1') {
    gameState.player1.ready = true;
    setUserActiveGame(gameState.player1.id, gameId);
  } else {
    gameState.player2.ready = true;
    setUserActiveGame(gameState.player2.id, gameId);
  }
  if (gameState.player1.ready && gameState.player2.ready) {
    resetGameState(gameState);
    setTimeout(() => {
      socket.to(gameId).emit('playAgain');
      socket.emit('playAgain');
      startGame(gameState);
    }, 2000);
  }
}

export function handleQuit(
  socket: Socket,
  gameId: string,
  userId: string,
): void {
  console.log('revived quit event!!');
  if (!gameId) {
    console.log('gameId is Null');
    return;
  }
  const gameState = getGameState(gameId);
  socket
    .to(gameId)
    .emit('opponentQuit', gameState ? gameState.game.status : null);
  if (gameState) {
    gameState.game.status = 'ended';
    removeUserActiveGame(gameState.player1.id);
    removeUserActiveGame(gameState.player2.id);
    deleteGame(gameState);
  }
  console.log('player quit');
}

export function handleCancelMatching(gameId: string) {
  const gameState = getGameState(gameId);
  if (gameState) {
    removeUserActiveGame(gameState.player1.id);
    removeUserActiveGame(gameState.player2.id);
  }
  deleteGame(getGameState(gameId));
  getAllGames().lobyGame = null;
}
