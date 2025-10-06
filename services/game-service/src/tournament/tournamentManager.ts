import { generateGameState } from '../remote-game/gameState';
import { getIoInstance } from '../socket/manager';
import { ITournament, IRound, IMatch } from '../types/types';
import { getAllGames } from '../remote-game/AllGames';
import { startGame } from '../remote-game/gameLogic';
import { match } from 'assert';

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
    creatorId: creatorId,
    creatorUsername: username,
    status: 'waiting',
    maxPlayers: maxPlayers,
    players: new Map(),
    bracket: [],
  };
  activeTournaments.set(tournamentId, newTournament);
  return newTournament;
}

export function getTournament(tournamentId: string): ITournament | undefined {
  return activeTournaments.get(tournamentId);
}

export function getAllWaitingTournaments(): ITournament[] {
  return Array.from(activeTournaments.values()).filter(
    (t) => t.status === 'waiting',
  );
}

export function deleteTournament(tournamentId: string): void {
  activeTournaments.delete(tournamentId);
}

export function setTournament(tournament: ITournament) {}

export function removePlayerFromTournamentLobby(
  tournamentId: string,
  userId: string,
): 'tournamentDeleted' | null {
  const tournament = activeTournaments.get(tournamentId);
  if (tournament && tournament.status === 'waiting') {
    console.log('players before delte: ', tournament.players);
    tournament.players.delete(userId);
    console.log('players after delete: ', tournament.players);
    if (tournament.players.size === 0 && tournament.creatorId === userId) {
      deleteTournament(tournamentId);
      return 'tournamentDeleted';
    }
  }
  return null;
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
      gameId: null,
      winnerId: null,
      nextMatchId: null,
      nextMatchSlot: null,
      status: 'ready',
    };
    currentRoundMatches.push(match);
  }
  tournament.bracket.push({ roundNumber: 1, matches: currentRoundMatches });

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
    tournament.bracket.push({ roundNumber: r, matches: nextRoundMatches });
    currentRoundMatches = nextRoundMatches;
  }
}

export function startTournament(tournament: ITournament) {
  const io = getIoInstance();

  tournament.status = 'live';
  generateBracket(tournament);
  io.to(tournament.id).emit('startTournament', {
    tournamentId: tournament.id,
    bracket: tournament.bracket,
  });

  const round1 = tournament.bracket[0];
  if (round1) {
    round1.matches.forEach((match) => {
      if (match.player1Id && match.player2Id) {
        startTournamentMatch(tournament, match);
      }
    });
  }
}

function startTournamentMatch(tournament: ITournament, match: IMatch) {
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
    console.error(`Missing player info for match ${match.id}.`);
    return;
  }

  const player1Socket = io.sockets.sockets.get(player1Info.socketId);
  const player2Socket = io.sockets.sockets.get(player2Info.socketId);
  if (!player1Socket || !player2Socket) {
    console.error("Couldn't get players sockets !!!");
    return;
  }

  player1Socket.join(gameId);
  player2Socket.join(gameId);

  const gameState = generateGameState(
    gameId,
    player1Info,
    player2Info,
    tournament.id,
    match.id,
  );
  getAllGames().games[gameId] = gameState;

  match.gameId = gameId;
  match.status = 'playing';

  // console.log("player 1 socketId: ", player1Info.socketId);
  // console.log("player 2 socketId: ", player2Info.socketId);
  player1Socket.emit('matchReady', {
    gameId,
    tournamentId: tournament.id,
    opponent: player2Info,
  });
  player2Socket.emit('matchReady', {
    gameId,
    tournamentId: tournament.id,
    opponent: player1Info,
  });

  setTimeout(() => {
    player1Socket.emit('playerData', {
      playerRole: 'player1',
      gameId,
      player: player1Info,
    });
    player2Socket.emit('playerData', {
      playerRole: 'player2',
      gameId,
      player: player2Info,
    });
    player1Socket.emit('matchFound', player2Info);
    player2Socket.emit('matchFound', player1Info);
    startGame(gameState);
  }, 2000);
}

function findMatchById(
  tournament: ITournament,
  matchId: string | null,
): IMatch | undefined {
  if (!matchId) return undefined;
  for (const round of tournament.bracket) {
    const match = round.matches.find((m) => m.id === matchId);
    if (match) return match;
  }
  return undefined;
}

export function advancePlayerInTournament(
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

  if (!currMatch.nextMatchId) {
    // TODO
    // the final match
  }

  const nextMatch = findMatchById(tournament, currMatch.nextMatchId);
  if (!nextMatch) return;

  if (currMatch.nextMatchSlot === 'player1Id') nextMatch.player1Id = winnerId;
  else if (currMatch.nextMatchSlot === 'player2Id')
    nextMatch.player2Id = winnerId;

  io.to(tournamentId).emit('bracketUpdate', tournament.bracket);
}
