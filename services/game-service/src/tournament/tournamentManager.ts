import { ITournament } from '../types/types';
export const activeTournaments = new Map<string, ITournament>();

export function createNewTournament(
  creatorId: string,
  maxPlayers: number,
  name: string,
): ITournament {
  const tournamentId = `tourney_${crypto.randomUUID().slice(0, 8)}`;
  const newTournament: ITournament = {
    id: tournamentId,
    creatorId: creatorId,
    name: name,
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
