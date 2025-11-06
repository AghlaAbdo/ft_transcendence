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
  removeUserActiveTournament,
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
    quitActiveGame(socket.id);
    removeUserSocket(socket.id);
  }, 5000);

  const userId = getUserId(socket.id);
  if (userId) {
    const userActiveGameId = getUserActiveGame(userId);
    const userActiveTournament = getUserActiveTournament(userId);
    if (userActiveGameId) {
      const gameState = getGameState(userActiveGameId);
      if (
        !getUserActiveTournament(userId) &&
        gameState &&
        gameState.game.status === 'waiting'
      ) {
        // console.log("gameStatus is 'waiting' in hadleDisconnect!");
        removeUserActiveGame(userId, userActiveGameId);
        getAllGames().lobyGame = null;
        deleteGame(gameState);
      } else if (
        !getUserActiveTournament(userId) &&
        gameState &&
        gameState.game.status != 'playing'
      ) {
        // console.log('gameStatus in handleDisconnect: ', gameState.game.status);
        handleQuit({ gameId: userActiveGameId, userId });
      }
    }
    if (userActiveTournament) {
      const tournament = getTournament(userActiveTournament);
      const match = getCurrentMatch(tournament, userId);
      if (match) {
        if (userId == match.player1Id) match.isPlayer1Ready = false;
        else match.isPlayer2Ready = false;
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
    socket.emit('inAnotherGame');
    return;
  }
  const tournamentId = getUserActiveTournament(userId);
  if (tournamentId) {
    socket.emit('registeredInTournament', { tournamentId });
    return;
  }

  const allGames = getAllGames();
  // console.log('allGamges length: ', Object.keys(allGames.games).length);

  // console.log('lobyGAme in handlePlay: ', allGames.lobyGame);
  if (!allGames.lobyGame) {
    console.log('--------- First Player Create a game');
    const gameId = crypto.randomUUID();
    setUserActiveGame(userId, gameId);
    allGames.games[gameId] = generateGameState(gameId, user, null, null, null);
    // console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
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
  // console.log('Recived rematch!!, gameId: ', gameId);
  // console.log('userId in handle rematch: ', userId);
  if (!playerRole) {
    console.log('playerRole is null!!');
    return;
  }

  const tournamentId = getUserActiveTournament(userId);
  if (tournamentId) {
    socket.emit('registeredInTournament', { tournamentId });
    return;
  }

  const user = await getPlayerInfo(userId);
  if (!user) return;
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

export function handleQuit(data: {
  userId: string;
  gameId: string;
  opponentId?: string;
}): void {
  // console.log('revived quit event!!, data: ', data);
  if (!data.gameId) {
    console.log('gameId is Null');
    return;
  }
  // console.log('gameId in handleQuit: ', data.gameId);
  const gameState = getGameState(data.gameId);
  let opponentId: string | null = null;
  if (gameState) {
    opponentId =
      data.userId === gameState.player1.id
        ? gameState.player2.id
        : gameState.player1.id;
  } else if (data.opponentId) opponentId = data.opponentId;
  const opponentSocketId = getUserSocketId(opponentId || '');
  if (opponentSocketId)
    ioInstance
      .to(opponentSocketId)
      .emit('opponentQuit', gameState ? gameState.game.status : null);
  if (!gameState) {
    return;
  }
  if (gameState && gameState.game.status === 'playing') {
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
    // console.log('gameStatus in handleQuit: ', gameState.game.status);
    gameState.game.status = 'ended';
    gameState.winner_id =
      gameState.player1.id === data.userId
        ? gameState.player2.id
        : gameState.player1.id;
    gameState.playtime = getDiffInMin(gameState.startAt);
    if (!gameState.startDate) gameState.startDate = getCurrDate();
    postGame(gameState);
    if (gameState.isTournamentGame) {
      removeUserActiveTournament(data.userId, gameState.tournamentId);
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

export function handleCancelMatching(data: { userId: string; gameId: string }) {
  const gameState = getGameState(data.gameId);
  // console.log('gameStatus in handleCancelMatching: ', gameState?.game.status);
  if (
    gameState?.player1.id != data.userId ||
    gameState?.game.status == 'playing'
  )
    return;
  getAllGames().lobyGame = null;
  if (gameState) {
    // console.log('did remove userActiveGAme in cancelMatching?');
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
  }
  console.log(' ---- called cancel Matching ??');
  deleteGame(gameState);
}

export function handleRequestGameState(socket: Socket, userId: string) {
  const gameId = getUserActiveGame(userId);
  // console.log('gameId in handleRequestGameState: ', gameId);

  if (gameId) {
    const gameState = getGameState(gameId);
    // if (gameState && gameState.game.status === 'playing' && socket.id != getUserSocketId(userId)) {
    //   socket.emit('inAnotherGame');
    //   return;
    // }
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

export function hancleQuitRemoteGamePage(data: {
  userId: string;
  gameId: string;
}) {
  const gameState = getGameState(data.gameId);
  if (gameState) {
    if (gameState.game.status === 'waiting') {
      handleCancelMatching(data);
    } else if (gameState.game.status === 'playing') {
      handleQuit(data);
    }
  }
}

export function handleGetGameInviteMatch(
  socket: Socket,
  data: { gameId: string; userId: string },
) {
  const gameState = getGameState(data.gameId);
  if (
    gameState &&
    (gameState.player1.id === data.userId ||
      gameState.player2.id === data.userId)
  ) {
    let player;
    let playerRole;
    let opponent;
    console.log('Indeed found gameInvite match!!');
    socket.join(gameState.id);
    if (gameState.player1.id === data.userId) {
      gameState.player1.ready = true;
      player = gameState.player1;
      opponent = gameState.player2.id ? gameState.player2 : null;
      playerRole = 'player1';
    } else {
      gameState.player2.ready = true;
      player = gameState.player2;
      opponent = gameState.player1;
      playerRole = 'player2';
    }
    // socket.emit('gameInviteFound');
    socket.emit('matchDetails', {
      gameId: gameState.id,
      gameStatus: gameState.game.status,
      player,
      opponent,
      playerRole,
    });
    if (gameState.player1.ready && gameState.player2.ready) {
      console.log('Indeed started gameInvite match!!');
      setUserActiveGame(gameState.player1.id, gameState.id);
      setUserActiveGame(gameState.player2.id, gameState.id);
      gameState.game.status = 'playing';
      startGame(gameState);
    }
  } else socket.emit('matchNotFound');
}

export function handleLeaveGameInvite(data: {
  userId: string;
  gameId: string;
}) {
  const gameState = getGameState(data.gameId);
  if (!gameState) return;
  console.log('Set user unready');
  if (data.userId === gameState.player1.id) gameState.player1.ready = false;
  else if (data.userId === gameState.player2.id)
    gameState.player2.ready = false;
}
