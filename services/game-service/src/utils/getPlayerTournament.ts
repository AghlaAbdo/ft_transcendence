import { IPlayer, ITournament } from '../types/types';
import { activeTournaments } from '../tournament/tournamentManager';

export function getPlayerTournament(socketId: string): {
  player: IPlayer | undefined;
  tournament: ITournament | undefined;
} {
  let foundPlayer;
  // TODO

  // const foundTournament = Array.from(activeTournaments.values()).find(
  //   (tournament) => {
  //     for (const player of tournament.players.values()) {
  //       // if (player.socketId === socketId) {
  //         foundPlayer = player;
  //         return true;
  //       // }
  //     }
  //     return false;
  //   },
  // );
  return { player: foundPlayer, tournament: undefined };
}
