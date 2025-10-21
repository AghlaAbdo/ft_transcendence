import { IMatch, TournamentDetails } from '@/constants/game';

export function getCurrentMatch(
  tournament: TournamentDetails,
  userId: string
): IMatch | null {
  for (const round of tournament.bracket) {
    for (const match of round.matches) {
      if (
        match.status == 'ready' &&
        (match.player1Id === userId || match.player2Id === userId)
      ) {
        return match;
      }
    }
  }
  return null;
}
