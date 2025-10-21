import { ITournament, TournamentDetails } from '@/types/types';

export function convertToTournamentDetails(
  tournament: ITournament,
): TournamentDetails {
  return {
    id: tournament.id,
    creatorId: tournament.creatorId,
    status: tournament.status,
    maxPlayers: tournament.maxPlayers,
    players: Array.from(tournament.players.values()),
    bracket: tournament.bracket,
  };
}
