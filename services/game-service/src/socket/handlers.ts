import { Server, Socket } from 'socket.io';
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
  getUserActiveTournament,
  quitActiveGame,
} from '../remote-game/userActiveGame';
import { getPlayerInfo } from '../utils/getPlayerInfo';
import { getCurrDate, getDiffInMin } from '../utils/dates';
import {
  advancePlayerInTournament,
  getTournament,
} from '../tournament/tournamentManager';
import { getCurrentMatch } from '../utils/getPlayerTournament';
import { IPlayer, ITournament } from '../types/types';
import {
  removeUserSocket,
  setUserSocket,
  setUserSocketNull,
  getUserId,
  getUserSocketId,
} from '../utils/userSocketMapping';

let ioInstance: Server;

export function handleConnection(
  socket: Socket,
  io: Server,
  userId: string,
): void {
  console.log('called handleConnection userId: ', userId);
  setIoInstance(io);
  setUserSocket(userId, socket.id);
  const userActiveGameId = getUserActiveGame(userId);
  const userActiveTournamentId = getUserActiveTournament(userId);
  if (userActiveGameId) {
    console.log('did join Socket to gameId again?: ', userActiveGameId);
    socket.join(userActiveGameId);
  }

  if (userActiveTournamentId) {
    socket.join(userActiveTournamentId);
    const tournament = getTournament(userActiveTournamentId);
    if (tournament) {
      const match = getCurrentMatch(tournament, userId);
      if (match && match.gameId) {
        socket.join(match.gameId);
      }
    }
  }
  ioInstance = io;
}

export function handleDisconnect(socket: Socket, reason: string): void {
  console.log('Disconnected id: ', socket.id, ' Because: ', reason);

  setUserSocketNull(socket.id);
  setTimeout(() => {
    quitActiveGame(socket);
    removeUserSocket(socket.id);
  }, 5000);

  const userId = getUserId(socket.id);
  if (userId) {
    const userActiveGameId = getUserActiveGame(userId);
    if (userActiveGameId) {
      const gameState = getGameState(userActiveGameId);
      if (gameState && gameState.game.status === 'waiting') {
        if (getUserActiveGame(userId)) {
          removeUserActiveGame(userId, userActiveGameId);
          deleteGame(gameState);
          getAllGames().lobyGame = null;
        }
      } else if (gameState && gameState.game.status != 'playing') {
        handleQuit(socket, userActiveGameId, userId);
      }
    }
  }

  return;
}

export async function handlePlay(socket: Socket, userId: string) {
  const user = await getPlayerInfo(userId);
  // console.log("user id: ", userId);
  // console.log("user: ", user);

  if (!user) return;
  if (getUserActiveGame(userId)) {
    console.log('inAnotherGame handlePlay');
    socket.emit('inAnotherGame');
    return;
  }

  const allGames = getAllGames();
  console.log('allGamges length: ', Object.keys(allGames.games).length);

  console.log('lobyGAme in handlePlay: ', allGames.lobyGame);
  if (!allGames.lobyGame) {
    const gameId = crypto.randomUUID();
    setUserActiveGame(userId, gameId);
    allGames.games[gameId] = generateGameState(gameId, user, null, null, null);
    console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
    socket.emit('playerData', {
      playerRole: 'player1',
      gameId,
      player: user,
    });
    socket.join(gameId);
    allGames.lobyGame = gameId;
  } else {
    console.log('---------- Second player joined!!');
    const lobyGameId = allGames.lobyGame;
    allGames.games[lobyGameId].game.status = 'playing';
    if (allGames.games[lobyGameId].player1.id === user.id) {
      deleteGame(allGames.games[lobyGameId]);
      allGames.lobyGame = null;
      return;
    }
    setUserActiveGame(userId, lobyGameId);
    allGames.games[lobyGameId].playersNb++;
    allGames.games[lobyGameId].player2.id = user.id;
    allGames.games[lobyGameId].player2.username = user.username;
    allGames.games[lobyGameId].player2.avatar = user.avatar;
    allGames.games[lobyGameId].player2.frame = user.frame;
    allGames.games[lobyGameId].player2.level = user.level;
    socket.join(lobyGameId);
    socket.emit('playerData', {
      playerRole: 'player2',
      gameId: lobyGameId,
      player: user,
    });
    socket
      .to(lobyGameId)
      .emit('matchFound', allGames.games[lobyGameId].player2);
    socket.emit('matchFound', allGames.games[lobyGameId].player1);
    setTimeout(() => {
      startGame(allGames.games[lobyGameId]);
    }, 3000);
    allGames.lobyGame = null;
  }
}

export function handleMovePaddle(
  gameId: string,
  playerRole: string,
  dir: 'up' | 'down',
) {
  // console.log("on movePaddle, gameId: ", gameId);
  // console.log("playerRole: ", playerRole);
  // console.log("dir: ", dir);
  const gameState = getGameState(gameId);
  if (!gameState) return;
  if (dir === 'up') paddleMoveUp(gameState, playerRole);
  else paddleMoveDown(gameState, playerRole);
}

export function handleGameOver(): void {
  // TODO
}

export async function handleRematch(
  socket: Socket,
  gameId: string,
  playerRole: 'player1' | 'player2' | null,
  userId: string,
) {
  console.log('Recived rematch!!, gameId: ', gameId);
  console.log('userId in handle rematch: ', userId);
  if (!playerRole) {
    console.log('playerRole is null!!');
    return;
  }

  const user = await getPlayerInfo(userId);
  if (!getGameState(gameId)) {
    const gameState = generateGameState(gameId, user, null, null, null);
    gameState.game.status = 'rematching';
    gameState.player1.ready = true;
    getAllGames().games[gameId] = gameState;
  } else {
    const gameState = getGameState(gameId);
    if (!gameState) return;

    gameState.game.status = 'rematching';
    const activeGame = getUserActiveGame(userId);
    if (activeGame && activeGame !== gameId) {
      socket.emit('inAnotherGame');
      socket.to(gameState.id).emit('opponentQuit', gameState.game.status);
      return;
    }

    gameState.playersNb++;
    gameState.player2.id = user.id;
    gameState.player2.username = user.username;
    gameState.player2.avatar = user.avatar;
    gameState.player2.frame = user.frame;
    gameState.player2.level = user.level;
    gameState.player2.ready = true;
    if (gameState.player1.ready && gameState.player2.ready) {
      setUserActiveGame(gameState.player1.id, gameId);
      setUserActiveGame(gameState.player2.id, gameId);
      gameState.game.status = 'playing';
      setTimeout(() => {
        socket.to(gameId).emit('playAgain');
        socket.emit('playAgain');
        startGame(gameState);
      }, 2000);
    }
  }
  socket.to(gameId).emit('rematch');
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
  console.log('gameId in handleQuit: ', gameId);
  const gameState = getGameState(gameId);
  if (!gameState) return;
  const opponentId =
    userId === gameState.player1.id
      ? gameState.player2.id
      : gameState.player1.id;
  const opponentSocketId = getUserSocketId(opponentId!);
  if (opponentSocketId)
    ioInstance
      .to(opponentSocketId)
      .emit('opponentQuit', gameState ? gameState.game.status : null);
  if (gameState && gameState.game.status === 'rematching') {
    removeUserActiveGame(userId, gameId);
  } else if (gameState && gameState.game.status === 'playing') {
    console.log('gameStatus in handleQuit: ', gameState.game.status);
    gameState.game.status = 'ended';
    gameState.winner_id =
      gameState.player1.id === userId
        ? gameState.player2.id
        : gameState.player1.id;
    gameState.playtime = getDiffInMin(gameState.startAt);
    if (!gameState.startDate) gameState.startDate = getCurrDate();
    postGame(gameState);
    if (gameState.isTournamentGame) {
      removeUserActiveGame(gameState.player1.id, gameState.id);
      removeUserActiveGame(gameState.player2.id, gameState.id);
    }
    if (gameState.isTournamentGame) {
      advancePlayerInTournament(
        gameState.tournamentId!,
        gameState.tournamentMatchId!,
        gameState.winner_id!,
      );
    }
  }
  deleteGame(gameState);
  console.log('player quit');
}

export function handleCancelMatching(gameId: string) {
  const gameState = getGameState(gameId);
  getAllGames().lobyGame = null;
  if (gameState) {
    console.log('did remove userActiveGAme in cancelMatching?');
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
  }
  console.log(' ---- called cancel Matching ??');
  deleteGame(gameState);
}

export function handleRequestGameState(socket: Socket, userId: string) {
  const gameId = getUserActiveGame(userId);
  console.log('gameId in handleRequestGameState: ', gameId);

  if (gameId) {
    const gameState = getGameState(gameId);
    // console.log('gameState is: ', gameState);
    if (gameState) {
      let player;
      let playerRole;
      let opponent;
      if (userId === gameState.player1.id) {
        player = gameState.player1;
        opponent = gameState.player2.id ? gameState.player2 : null;
        playerRole = 'player1';
      } else {
        player = gameState.player2;
        opponent = gameState.player1;
        playerRole = 'player2';
      }
      socket.emit('matchDetails', {
        gameId,
        gameStatus: gameState.game.status,
        player,
        opponent,
        playerRole,
      });
      return;
    }
  }
  socket.emit('matchDetails', {
    gameId: null,
    gameStatus: 'notFound',
    player: null,
    opponent: null,
    playerRole: null,
  });
}
