import { IGameState, IGmaes } from '../types/types';

const allGames: IGmaes = {
  lobyGame: null,
  games: new Map<string, IGameState>(),
};

export function getAllGames(): IGmaes {
  return allGames;
}

export function getGameState(
  gameId: string | undefined,
): IGameState | undefined {
  if (gameId) return allGames.games.get(gameId);
  return undefined;
}

export function deleteGame(gameId: string | null): void {
  if (!gameId) return;

  allGames.games.delete(gameId);
}

export function addGameState(gameState: IGameState) {
  allGames.games.set(gameState.id, gameState);
}
