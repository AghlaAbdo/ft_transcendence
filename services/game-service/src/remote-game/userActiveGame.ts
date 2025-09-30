const userActiveGame = new Map<string, string>();

export function setUserActiveGame(userId: string | null, gameId: string): void {
  if (!userId)
      return;
  userActiveGame.set(userId, gameId);
}

export function getUserActiveGame(userId: string | null): string | undefined {
  if (!userId)
    return undefined;
  return userActiveGame.get(userId);
}

export function removeUserActiveGame(userId: string | null): void {
  if (!userId)
      return;
  userActiveGame.delete(userId);
}