import { getIoInstance } from '../socket/manager';
import { ITournament, IRound, IMatch } from '../types/types';

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

  generateBracket(tournament);
  io.to(tournament.id).emit('startTournament', {
    tournamentId: tournament.id,
    bracket: tournament.bracket,
  });
}
