import { IGameState, IGmaes } from '../types/types';

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
