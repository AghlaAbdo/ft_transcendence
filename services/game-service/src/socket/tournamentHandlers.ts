import { Socket } from 'socket.io';
import {
  getUserActiveGame,
  setUserActiveGame,
  removeUserActiveGame,
  setUserActiveTournament,
  getUserActiveTournament,
  removeUserActiveTournament,
} from '../remote-game/userActiveGame';
import { getPlayerInfo } from '../utils/getPlayerInfo';
import {
  createNewTournament,
  getTournament,
  getAllWaitingTournaments,
  removePlayerFromTournamentLobby,
  startTournament,
  startTournamentMatch,
} from '../tournament/tournamentManager';
import { ITournament } from '../types/types';
import { getIoInstance } from './manager';
import { getGameState } from '../remote-game/AllGames';
import { findMatchById } from '../tournament/tournamentManager';
import { toUSVString } from 'util';

export async function handleCreateTournament(
  socket: Socket,
  userId: string,
  maxPlayers: number = 4,
  name: string,
): Promise<void> {
  const ioInstance = getIoInstance();
  // console.log('called create tournament!!!');
  // console.log('tournament name: ', name);
  const user = await getPlayerInfo(userId);
  if (!user) return;

  if (getUserActiveTournament(userId)) {
    console.log('user in another game in handleCreatetournament!');
    socket.emit('inTournament', {
      tournamentId: getUserActiveTournament(userId),
    });
    return;
  }
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
  console.log('playerJoined in createTournament: ', playerJoined);

  if (playerJoined) {
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
  const ioInstance = getIoInstance();

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

  if (getUserActiveTournament(userId)) {
    console.log('user in another game in handleCreatetournament!');
    socket.emit('inTournament', {
      tournamentId: getUserActiveTournament(userId),
    });
    return;
  }

  const playerJoined = joinPlayerToTournament(tournament, userId, user, socket);

  if (playerJoined) {
    socket.emit('tournamentJoined', { tournamentId: tournamentId });
    ioInstance.to(tournamentId).emit('tournamentPlayerUpdate', {
      userId: userId,
      action: 'joined',
      user,
    });
    if (tournament.players.size == tournament.maxPlayers) {
      startTournament(tournament);
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

  setUserActiveTournament(userId, tournament.id);
  tournament.players.set(userId, { ...user, isEliminated: false });
  socket.join(tournament.id);

  return true;
}

export function handleTournPlayerInLoby(
  socket: Socket,
  data: { userId: string; tournamentId: string },
) {
  const tournament = getTournament(data.tournamentId);
  const ioInstance = getIoInstance();
  if (!tournament || !tournament.players.get(data.userId)) {
    console.log('Player not in Tournament !!');
    socket.emit('notInTournament');
    return;
  }

  console.log('did increment readyPlayers??');
  tournament.readyPlayers++;
  // if (tournament.readyPlayers === tournament.maxPlayers) {
  //   startTournament(tournament);
  //   ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
  // }
}

export function handleRequestTournaments(
  socket: Socket,
  data: { userId: string },
) {
  const tournamentId = getUserActiveTournament(data.userId);
  if (tournamentId) {
    socket.emit('inTournament', { tournamentId });
    return;
  }
  if (getUserActiveGame(data.userId)) {
    socket.emit('inAnotherGame');
    return;
  }
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
    socket.emit('notInTournament');
    return;
  }

  const player = tournament.players.get(userId);
  if (!player) {
    socket.emit('notInTournament');
    return;
  }

  socket.emit('tournamentDetails', {
    id: tournament.id,
    winner: tournament.winner,
    status: tournament.status,
    maxPlayers: tournament.maxPlayers,
    players: Array.from(tournament.players.values()),
    bracket: tournament.bracket,
  });
}

export function handleLeaveTournamentLobby(
  socket: Socket,
  data: {
    userId: string;
    tournamentId: string;
  },
): void {
  const ioInstance = getIoInstance();
  console.log(
    'called LeavLobby, userId: ',
    data.userId,
    ' tournamentId: ',
    data.tournamentId,
  );
  const tournament = getTournament(data.tournamentId);
  if (!tournament) {
    socket.emit('tournamentError', 'Tournament not found.');
    return;
  }
  // if (tournament.status !== 'waiting') {
  //   socket.emit(
  //     'tournamentError',
  //     'Cannot leave a tournament that has already started.',
  //   );
  //   return;
  // }

  const action = removePlayerFromTournamentLobby(
    data.tournamentId,
    data.userId,
  );

  console.log('did sent tournment playerUpdate after player remove??');
  ioInstance.to(data.tournamentId).emit('tournamentPlayerUpdate', {
    userId: data.userId,
    action: 'left',
  });
  removeUserActiveTournament(data.userId, data.tournamentId);
  socket.leave(data.tournamentId);
  if (action === 'tournamentDeleted')
    ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
  socket.emit('leftTournamentLobby', { tournamentId: data.tournamentId });
}

export function handleReadyForMatch(
  socket: Socket,
  data: { userId: string; tournamentId: string; gameId: string },
) {
  console.log('data in handleReady for Match: ', data);
  const tournament = getTournament(data.tournamentId);
  const gameState = getGameState(data.gameId);
  if (!gameState || !tournament) {
    console.log('!gameState || !tournament in handleReadyForMatch');
    socket.emit('notInMatch');
    return;
  }
  // setUserActiveGame(data.userId, data.gameId);
  socket.emit('inMatch');
  console.log('sent Inmatch??');
  // gameState.game.status = 'playing';
  if (gameState.game.status === 'playing') {
    console.log("gameStatus is 'playing' in handleReadyForMatch!!");
    return;
  }
  console.log('got readyForMatch, userId: ', data.userId);
  const match = findMatchById(tournament, gameState.tournamentMatchId);

  if (!match) return;
  data.userId === match.player1Id
    ? (match.isPlayer1Ready = true)
    : (match.isPlayer2Ready = true);

  if (match.isPlayer1Ready && match.isPlayer2Ready)
    startTournamentMatch(tournament, match.id);
}

export function handleQuitTournament(data: {
  userId: string;
  tournamentId: string;
}) {
  removeUserActiveTournament(data.userId, data.tournamentId);
}

export function handleRequestTournMatchDetails(
  socket: Socket,
  data: {
    userId: string;
    tournamentId: string;
    matchGameId: string;
  },
) {
  const tournament = getTournament(data.tournamentId);
  if (data.matchGameId) {
    const gameState = getGameState(data.matchGameId);
    // console.log('gameState is: ', gameState);
    if (gameState) {
      let player;
      let playerRole;
      let opponent;
      if (data.userId === gameState.player1.id) {
        player = gameState.player1;
        opponent = gameState.player2.id ? gameState.player2 : null;
        playerRole = 'player1';
      } else {
        player = gameState.player2;
        opponent = gameState.player1;
        playerRole = 'player2';
      }
      socket.emit('tournMatchDetails', {
        gameId: data.matchGameId,
        gameStatus: gameState.game.status,
        player,
        opponent,
        playerRole,
      });
      return;
    }
  }
  socket.emit('tournMatchDetails', {
    gameId: null,
    gameStatus: 'notFound',
    player: null,
    opponent: null,
    playerRole: null,
  });
}
