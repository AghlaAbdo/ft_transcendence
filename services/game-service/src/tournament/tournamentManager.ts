import { generateGameState } from '../remote-game/gameState';
import { getIoInstance } from '../socket/manager';
import {
  ITournament,
  TournamentListItem,
  IMatch,
  IGameState,
} from '../types/types';
import {
  getAllGames,
  getGameState,
  deleteGame,
  addGameState,
} from '../remote-game/AllGames';
import { startGame } from '../remote-game/gameLogic';
import { match } from 'assert';
import {
  removeUserActiveGame,
  removeUserActiveTournament,
  setUserActiveGame,
} from '../remote-game/userActiveGame';
import { getUserSocketId } from '../utils/userSocketMapping';
import { convertToTournamentDetails } from '../utils/convertTypes';
import { getPlayerInfo } from '../utils/getPlayerInfo';
import { handleQuit } from '../socket/handlers';
import { postGame } from '../models/game.model';
import { getCurrDate, getDiffInSec } from '../utils/dates';
import { logEvent } from '../server';

export const activeTournaments = new Map<string, ITournament>();

export function createNewTournament(
  creatorId: string,
  username: string,
  maxPlayers: number,
  name: string,
): ITournament {
  const tournamentId = `tourney_${crypto.randomUUID().slice(0, 8)}`;
  const newTournament: ITournament = {
    id: tournamentId,
    name: name,
    winner: null,
    creatorUsername: username,
    status: 'waiting',
    maxPlayers: maxPlayers,
    readyPlayers: 0,
    players: new Map(),
    bracket: [],
  };
  activeTournaments.set(tournamentId, newTournament);
  return newTournament;
}

export function getTournament(tournamentId: string): ITournament | undefined {
  return activeTournaments.get(tournamentId);
}

export function getAllWaitingTournaments(): TournamentListItem[] {
  return Array.from(activeTournaments.values())
    .filter((t) => t.status === 'waiting')
    .map((t) => ({
      id: t.id,
      name: t.name,
      maxPlayers: t.maxPlayers,
      currentPlayers: t.players.size,
      status: t.status,
      creatorUsername: t.creatorUsername,
    }));
}

export function deleteTournament(tournamentId: string): void {
  activeTournaments.delete(tournamentId);
}

export function setTournament(tournament: ITournament) {}

export function removePlayerFromTournamentLobby(
  tournamentId: string,
  userId: string,
): void {
  const tournament = activeTournaments.get(tournamentId);
  if (tournament && tournament.status === 'waiting') {
    tournament.readyPlayers--;
    // console.log('players before delte: ', tournament.players);
    tournament.players.delete(userId);
    // console.log('players after delete: ', tournament.players);
    if (tournament.players.size === 0) {
      deleteTournament(tournamentId);
    }
  }
}

function generateBracket(tournament: ITournament): void {
  const playersArray = Array.from(tournament.players.values());
  playersArray.sort(() => Math.random() - 0.5);

  const numPlayers = playersArray.length;
  const numRounds = Math.log2(numPlayers);

  tournament.bracket = [];

  let currentRoundMatches: IMatch[] = [];
  let nextRoundMatches: IMatch[] = [];

  // --- First round ---
  for (let i = 0; i < numPlayers / 2; i++) {
    const matchId = `match_${crypto.randomUUID().slice(0, 8)}`;
    const player1 = playersArray[i * 2];
    const player2 = playersArray[i * 2 + 1];

    const match: IMatch = {
      id: matchId,
      round: 1,
      player1Id: player1.id,
      player2Id: player2.id,
      isPlayer1Ready: false,
      isPlayer2Ready: false,
      gameId: null,
      winnerId: null,
      nextMatchId: null,
      nextMatchSlot: null,
      status: 'ready',
    };
    currentRoundMatches.push(match);
  }
  tournament.bracket.push({
    roundNumber: 1,
    matchesInRound: numPlayers / 2,
    PlayedMatches: 0,
    matches: currentRoundMatches,
  });

  // --- Subsequent Rounds ---
  for (let r = 2; r <= numRounds; r++) {
    nextRoundMatches = [];
    const matchesInRound = currentRoundMatches.length / 2;

    for (let i = 0; i < matchesInRound; i++) {
      const nextMatchId = `match_${crypto.randomUUID().slice(0, 8)}`;
      const nextMatch: IMatch = {
        id: nextMatchId,
        round: r,
        player1Id: null,
        player2Id: null,
        isPlayer1Ready: false,
        isPlayer2Ready: false,
        gameId: null,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        status: 'pending',
      };
      nextRoundMatches.push(nextMatch);

      const prevMatch1 = currentRoundMatches[i * 2];
      const prevMatch2 = currentRoundMatches[i * 2 + 1];

      prevMatch1.nextMatchId = nextMatchId;
      prevMatch1.nextMatchSlot = 'player1Id';

      prevMatch2.nextMatchId = nextMatchId;
      prevMatch2.nextMatchSlot = 'player2Id';
    }
    tournament.bracket.push({
      roundNumber: r,
      matchesInRound,
      PlayedMatches: 0,
      matches: nextRoundMatches,
    });
    currentRoundMatches = nextRoundMatches;
  }
}

export function startTournament(tournament: ITournament) {
  const io = getIoInstance();

  tournament.status = 'live';
  generateBracket(tournament);

  const round1 = tournament.bracket[0];
  if (round1) {
    round1.matches.forEach((match) => {
      if (match.player1Id && match.player2Id) {
        notifyPlayersForMatch(tournament, match);
      }
    });
  }

  io.to(tournament.id).emit(
    'tournamentDetails',
    convertToTournamentDetails(tournament),
  );
}

function notJoinTournamentMatch(
  tournament: ITournament,
  match: IMatch,
  gameState: IGameState,
  userId: string,
  opponentId: string,
) {
  removeUserActiveTournament(userId, gameState.tournamentId);
  removeUserActiveGame(gameState.player1.id, gameState.id);
  removeUserActiveGame(gameState.player2.id, gameState.id);
  gameState.game.status = 'ended';
  gameState.winner_id =
    gameState.player1.id === userId
      ? gameState.player2.id
      : gameState.player1.id;
  gameState.playtime = gameState.startAt ? getDiffInSec(gameState.startAt) : 0;
  if (!gameState.startDate) gameState.startDate = getCurrDate();
  postGame(gameState);
  advancePlayerInTournament(
    gameState.tournamentId!,
    gameState.tournamentMatchId!,
    gameState.winner_id!,
  );

  const ioInstance = getIoInstance();
  const opponentSocketId = getUserSocketId(opponentId);
  if (opponentSocketId) {
    ioInstance.to(opponentSocketId).emit('opponentNotJoined');
  }
  ioInstance.to(tournament.id).emit('tournamentDetails', {
    id: tournament.id,
    winner: tournament.winner,
    status: tournament.status,
    maxPlayers: tournament.maxPlayers,
    players: Array.from(tournament.players.values()),
    bracket: tournament.bracket,
  });
  deleteGame(gameState.id);
}

function notifyPlayersForMatch(tournament: ITournament, match: IMatch) {
  if (!match.player1Id || !match.player2Id) {
    console.error(
      `Match ${match.id} in tournament ${tournament.id} is not ready to start (missing players).`,
    );
    return;
  }
  const io = getIoInstance();

  const gameId = crypto.randomUUID();
  const player1Info = tournament.players.get(match.player1Id);
  const player2Info = tournament.players.get(match.player2Id);

  if (!player1Info || !player2Info) {
    console.log(`Missing player info for match ${match.id}.`);
    return;
  }

  const player1SocketId = getUserSocketId(player1Info.id);
  const player2SocketId = getUserSocketId(player2Info.id);
  if (!player1SocketId || !player2SocketId) {
    console.log("Couldn't get players sockets !!!");
    return;
  }

  const gameState = generateGameState(
    gameId,
    player1Info,
    'tournament',
    player2Info,
    tournament.id,
    match.id,
  );
  addGameState(gameState);
  match.gameId = gameId;

  io.to(player1SocketId).emit('matchReady', { gameId, opponent: player2Info });
  io.to(player2SocketId).emit('matchReady', { gameId, opponent: player1Info });
  io.in(player1SocketId).socketsJoin(gameId);
  io.in(player2SocketId).socketsJoin(gameId);
  setTimeout(() => {
    if (!match.isPlayer1Ready) {
      notJoinTournamentMatch(
        tournament,
        match,
        gameState,
        match.player1Id!,
        match.player2Id!,
      );
    } else if (!match.isPlayer2Ready) {
      notJoinTournamentMatch(
        tournament,
        match,
        gameState,
        match.player2Id!,
        match.player1Id!,
      );
    }
  }, 60 * 1e3);
}

export function startTournamentMatch(tournament: ITournament, matchId: string) {
  const match = findMatchById(tournament, matchId);
  if (!match) return;

  const io = getIoInstance();
  const gameState = getGameState(match.gameId!);
  if (!gameState) return;
  const player1Info = tournament.players.get(match.player1Id!);
  const player2Info = tournament.players.get(match.player2Id!);
  if (!player1Info || !player2Info) {
    console.error(`Missing player info for match ${match.id}.`);
    return;
  }
  // setUserActiveGame(player1Info.id, gameState.id);
  // setUserActiveGame(player2Info.id, gameState.id);
  const player1SocketId = getUserSocketId(player1Info.id);
  const player2SocketId = getUserSocketId(player2Info.id);
  if (!player1SocketId || !player2SocketId) {
    console.error("Couldn't get players sockets in startTournamentMatch !!!");
    return;
  }

  match.status = 'playing';
  gameState.game.status = 'playing';
  io.to(player1SocketId).emit('playerData', {
    playerRole: 'player1',
    gameId: gameState.id,
    player: player1Info,
  });
  io.to(player2SocketId).emit('playerData', {
    playerRole: 'player2',
    gameId: gameState.id,
    player: player2Info,
  });
  io.to(player1SocketId).emit('matchFound', player2Info);
  io.to(player2SocketId).emit('matchFound', player1Info);
  logEvent('info', 'game', 'match_play', { mode: 'tournament' });
  startGame(gameState);
}

export function findMatchById(
  tournament: ITournament | undefined,
  matchId: string | null,
): IMatch | undefined {
  if (!matchId || !tournament) return undefined;
  for (const round of tournament.bracket) {
    const match = round.matches.find((m) => m.id === matchId);
    if (match) return match;
  }
  return undefined;
}

export async function advancePlayerInTournament(
  tournamentId: string,
  matchId: string,
  winnerId: string,
) {
  const io = getIoInstance();
  const tournament = getTournament(tournamentId);
  if (!tournament) return;

  const currMatch = findMatchById(tournament, matchId);
  if (!currMatch) return;
  currMatch.status = 'completed';
  currMatch.winnerId = winnerId;

  const loserId =
    winnerId === currMatch.player1Id
      ? currMatch.player2Id
      : currMatch.player1Id;
  if (loserId) {
    const loser = tournament.players.get(loserId);
    if (loser) {
      loser.isEliminated = true;
    }
  }

  // the final match
  if (!currMatch.nextMatchId) {
    const winner = await getPlayerInfo(winnerId);
    tournament.status = 'completed';
    tournament.winner = winner;
    removeUserActiveTournament(currMatch.winnerId, tournamentId);
    io.to(tournamentId).emit('bracketUpdate', tournament.bracket);
    io.to(tournamentId).emit('tournamentWinner', { winner });
    setTimeout(() => deleteTournament(tournamentId), 300 * 1e3);
    return;
  }

  const nextMatch = findMatchById(tournament, currMatch.nextMatchId);
  if (!nextMatch) {
    return;
  }

  if (currMatch.nextMatchSlot === 'player1Id') nextMatch.player1Id = winnerId;
  else if (currMatch.nextMatchSlot === 'player2Id')
    nextMatch.player2Id = winnerId;

  // Round starting from 1
  const round = tournament.bracket[currMatch.round - 1];
  // console.log("curr round index: ", currMatch.round - 1);
  round.PlayedMatches++;
  if (round.PlayedMatches === round.matchesInRound) {
    // console.log("playedMatches === roundMatches");
    const nextRound = tournament.bracket[currMatch.round];
    if (nextRound) {
      // console.log("found next round, i: ", currMatch.round);
      nextRound.matches.forEach((match) => {
        if (match.player1Id && match.player2Id) {
          match.status = 'ready';
          setTimeout(() => {
            notifyPlayersForMatch(tournament, match);
          }, 6000);
        }
      });
    }
  }

  io.to(tournamentId).emit('bracketUpdate', tournament.bracket);
}
