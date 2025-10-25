import { IPlayer, ITournament, IMatch } from '../types/types';
import { activeTournaments } from '../tournament/tournamentManager';

// export function getPlayerTournament(socketId: string): {
//   player: IPlayer | undefined;
//   tournament: ITournament | undefined;
// } {
//   let foundPlayer;
//   // TODO

//   // const foundTournament = Array.from(activeTournaments.values()).find(
//   //   (tournament) => {
//   //     for (const player of tournament.players.values()) {
//   //       // if (player.socketId === socketId) {
//   //         foundPlayer = player;
//   //         return true;
//   //       // }
//   //     }
//   //     return false;
//   //   },
//   // );
//   return { player: foundPlayer, tournament: undefined };
// }

export function getCurrentMatch(
  tournament: ITournament | undefined,
  userId: string,
): IMatch | null {
  if (!tournament) return null;
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
