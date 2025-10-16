import { IGameState, IGmaes } from '../types/types';

const allGames: IGmaes = {
  lobyGame: null,
  games: {},
};

export function getAllGames(): IGmaes {
  return allGames;
}

export function getGameState(gameId: string | undefined ): IGameState | undefined {
  if (gameId)
    return allGames.games[gameId];
  return undefined
}
