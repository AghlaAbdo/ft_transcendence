import { Socket } from 'socket.io';
import {
  getUserActiveGame,
  setUserActiveGame,
  removeUserActiveGame,
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
  console.log('called create tournament!!!');
  const user = await getPlayerInfo(userId);
  if (!user) return;

  if (getUserActiveGame(userId)) {
    socket.emit('inAnotherGame');
    return;
  }

  user.socketId = socket.id;
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

  user.socketId = socket.id;
  const playerJoined = joinPlayerToTournament(tournament, userId, user, socket);

  if (playerJoined) {
    setUserActiveGame(userId, tournamentId);

    socket.emit('tournamentJoined', { tournamentId: tournamentId });
    ioInstance.to(tournamentId).emit('tournamentPlayerUpdate', {
      userId: userId,
      action: 'joined',
      user,
    });
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

export function handleTournPlayerInLoby(socket: Socket, data: {tournamentId: string}) {
  const tournament = getTournament(data.tournamentId);
  const ioInstance = getIoInstance();

  if (!tournament) return;
  tournament.readyPlayers++;
  if (tournament.readyPlayers === tournament.maxPlayers) {
    startTournament(tournament)
    ioInstance.emit('tournamentListUpdate', getAllWaitingTournaments());
  }
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
  const ioInstance = getIoInstance();
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

export function handleReadyForMatch(socket: Socket, data: {userId: string, tournamentId: string, gameId: string}) {
  const tournament = getTournament(data.tournamentId);
  const gameState = getGameState(data.gameId);
  const match = findMatchById(tournament, gameState.tournamentMatchId);

  if (!match || !tournament) return;
  data.userId === match.player1Id ? match.isPlayer1Ready = true : match.isPlayer2Ready = true;

  if (match.isPlayer1Ready && match.isPlayer2Ready)
    startTournamentMatch(tournament, match.id);
}