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
} from '../remote-game/userActiveGame';
import { getPlayerInfo } from '../utils/getPlayerInfo';
import { getCurrDate, getDiffInMin } from '../utils/dates';
import {
  createNewTournament,
  getTournament,
  getAllWaitingTournaments,
  removePlayerFromTournamentLobby,
} from '../tournament/tournamentManager';
import { ITournament } from '@/types/types';

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

    gameToQuit.winner_id =
      quitterRole === 'player1' ? gameToQuit.player2.id : gameToQuit.player1.id;
    gameToQuit.playtime = gameToQuit.startAt
      ? getDiffInMin(gameToQuit.startAt)
      : 0;
    if (!gameToQuit.startDate) gameToQuit.startDate = getCurrDate();
    postGame(gameToQuit);

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
    const gameStatus = gameToQuit.game.status;
    if (gameStatus === 'waiting' || gameStatus === 'playing') {
      gameToQuit.game.status = 'ended';
      removeUserActiveGame(gameToQuit.player1.id, gameToQuit.id);
      removeUserActiveGame(gameToQuit.player2.id, gameToQuit.id);
      if (allGames.lobyGame === gameToQuit.id) {
        allGames.lobyGame = null;
      }
      deleteGame(gameToQuit);
    } else {
      deleteGame(gameToQuit);
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
    setUserActiveGame(userId, gameId);
    allGames.games[gameId] = generateGameState(gameId, user, socket.id);
    console.log('\ncurr time: ', allGames.games[gameId].startDate, '\n');
    socket.emit('playerData', {
      playerRole: 'player1',
      gameId,
      player: player1,
    });
    socket.join(gameId);
    allGames.lobyGame = gameId;
  } else {
    const lobyGameId = allGames.lobyGame;
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
    allGames.games[lobyGameId].player2.socketId = socket.id;
    socket.join(lobyGameId);
    socket.emit('playerData', {
      playerRole: 'player2',
      gameId: lobyGameId,
      player: player2,
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

  const userId =
    playerRole === 'player1' ? gameState.player1.id : gameState.player2.id;
  const activeGame = getUserActiveGame(userId);
  if (activeGame && activeGame !== gameId) {
    socket.emit('inAnotherGame');
    socket.to(gameState.id).emit('opponentQuit', gameState.game.status);
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
    return;
  }

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
    gameState.winner_id =
      gameState.player1.id === userId
        ? gameState.player2.id
        : gameState.player1.id;
    gameState.playtime = getDiffInMin(gameState.startAt);
    postGame(gameState);
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
    deleteGame(gameState);
  }
  console.log('player quit');
}

export function handleCancelMatching(gameId: string) {
  const gameState = getGameState(gameId);
  if (gameState) {
    removeUserActiveGame(gameState.player1.id, gameState.id);
    removeUserActiveGame(gameState.player2.id, gameState.id);
  }
  deleteGame(getGameState(gameId));
  getAllGames().lobyGame = null;
}

export async function handleCreateTournament(
  socket: Socket,
  userId: string,
  maxPlayers: number = 4,
  name: string,
): Promise<void> {
  console.log('called create tournament!!!');
  const user = await getPlayerInfo(userId);
  if (!user) return;

  if (getUserActiveGame(userId)) {
    socket.emit('inAnotherGame');
    return;
  }

  const newTournament = createNewTournament(
    userId,
    user.username,
    maxPlayers,
    name,
  );
  console.log('Tournament Created: ', newTournament);
  const playerJoined = joinPlayerToTournament(
    newTournament,
    userId,
    user,
    socket,
  );

  if (playerJoined) {
    setUserActiveGame(userId, newTournament.id);
    socket.join(newTournament.id);
    socket.emit('tournamentCreated', { tournamentId: newTournament.id });
    ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
  }
}

export async function handleJoinTournament(
  socket: Socket,
  userId: string,
  tournamentId: string,
): Promise<void> {
  const tournament = getTournament(tournamentId);
  const user = await getPlayerInfo(userId);

  if (!tournament || !user) {
    return;
  }

  if (
    tournament.status !== 'waiting' ||
    tournament.players.size >= tournament.maxPlayers
  ) {
    socket.emit('tournamentFull');
    return;
  }

  if (getUserActiveGame(userId)) {
    socket.emit('inAnotherGame');
    return;
  }

  const playerJoined = joinPlayerToTournament(tournament, userId, user, socket);

  if (playerJoined) {
    setUserActiveGame(userId, tournamentId);

    socket.emit('tournamentJoined', { tournamentId: tournamentId });
    ioInstance.to(tournamentId).emit('tournamentPlayerUpdate', {
      userId: userId,
      action: 'joined',
      user,
    });

    if (tournament.players.size === tournament.maxPlayers) {
      // startTournament(tournament);
      ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
    }
  }
  console.log('joined tournamentId: ', tournamentId, ' userId: ', userId);
}

function joinPlayerToTournament(
  tournament: ITournament,
  userId: string,
  user: any,
  socket: Socket,
): boolean {
  if (tournament.players.has(userId)) return false;

  tournament.players.set(userId, user);
  socket.join(tournament.id);

  return true;
}

export function handleRequestTournaments(socket: Socket) {
  const tournaments = getAllWaitingTournaments();
  socket.emit('tournamentList', tournaments);
}

export function handleRequestTournamentDetails(
  socket: Socket,
  userId: string,
  tournamentId: string,
): void {
  const tournament = getTournament(tournamentId);
  console.log('sent tournament details');
  if (!tournament) {
    console.log('Error: !tournament');
    console.log('tonrnamentId: ', tournamentId);
    socket.emit('tournamentError', 'Tournament not found.');
    // socket.emit('redirect', '/tournament');
    return;
  }

  socket.join(tournamentId);

  socket.emit('tournamentDetails', {
    id: tournament.id,
    creatorId: tournament.creatorId,
    status: tournament.status,
    maxPlayers: tournament.maxPlayers,
    players: Array.from(tournament.players.values()),
    bracket: tournament.bracket,
  });
}

export function handleLeaveTournamentLobby(
  socket: Socket,
  userId: string,
  tournamentId: string,
): void {
  console.log(
    'called LeavLobby, userId: ',
    userId,
    ' tournamentId: ',
    tournamentId,
  );
  const tournament = getTournament(tournamentId);
  if (!tournament) {
    socket.emit('tournamentError', 'Tournament not found.');
    return;
  }
  if (tournament.status !== 'waiting') {
    socket.emit(
      'tournamentError',
      'Cannot leave a tournament that has already started.',
    );
    return;
  }

  const action = removePlayerFromTournamentLobby(tournamentId, userId);

  console.log('did sent tournment playerUpdate after player remove??');
  ioInstance.to(tournamentId).emit('tournamentPlayerUpdate', {
    userId,
    action: 'left',
  });
  removeUserActiveGame(userId, tournamentId);
  socket.leave(tournamentId);
  if (action === 'tournamentDeleted')
    ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
  socket.emit('leftTournamentLobby', { tournamentId });
}
