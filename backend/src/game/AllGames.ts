import { IGameState, IGmaes } from '../types/game';

const allGames: IGmaes = {
  lobyGame: null,
  games: {},
};

export function getAllGames(): IGmaes {
  return allGames;
}

export function getGameState(gameId: string): IGameState {
  return allGames.games[gameId];
}
