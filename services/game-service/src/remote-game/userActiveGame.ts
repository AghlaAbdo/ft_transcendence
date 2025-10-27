import { Socket } from 'socket.io';
import { getUserId, getUserSocketId } from '../utils/userSocketMapping';
import { handleQuit } from '../socket/handlers';
import { getGameState } from './AllGames';

const userActiveGame = new Map<string, string>();
const userActiveTournament = new Map<string, string>();

export function setUserActiveGame(userId: string | null, gameId: string): void {
  if (!userId) return;
  userActiveGame.set(userId, gameId);
}

export function getUserActiveGame(userId: string | null): string | undefined {
  if (!userId) return undefined;
  return userActiveGame.get(userId);
}

export function removeUserActiveGame(
  userId: string | null,
  gameId: string | null,
): void {
  if (!userId || !gameId) return;
  if (getUserActiveGame(userId) === gameId) userActiveGame.delete(userId);
}

export function setUserActiveTournament(
  userId: string | null,
  tournamentId: string,
): void {
  if (!userId) return;
  userActiveTournament.set(userId, tournamentId);
}

export function getUserActiveTournament(
  userId: string | null,
): string | undefined {
  if (!userId) return undefined;
  return userActiveTournament.get(userId);
}

export function removeUserActiveTournament(
  userId: string | null,
  tournamentId: string | null,
): void {
  if (!userId || !tournamentId) return;
  if (getUserActiveTournament(userId) === tournamentId)
    userActiveTournament.delete(userId);
}

export function quitActiveGame(socket: Socket) {
  const userId = getUserId(socket.id);
  // console.log("called quitActiveGame!!");
  if (userId) {
    if (getUserSocketId(userId)) return;
    const activeGameId = getUserActiveGame(userId);
    const gameState = getGameState(activeGameId);
    if (gameState && activeGameId) {
      removeUserActiveGame(userId, activeGameId);
      console.log('---- did remove userActiveGame in Disconnect!!');
      // console.log("called quit from quitActiveGame");
      handleQuit({ gameId: gameState.id, userId });
    }
  }
}
