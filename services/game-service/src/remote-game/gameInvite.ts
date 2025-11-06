import crypto from 'crypto';
import { IPlayer } from '../types/types';
import { generateGameState } from './gameState';
import { getAllGames } from './AllGames';
import { getUserSocketId } from '../utils/userSocketMapping';
import { getIoInstance } from '../socket/manager';
import { removeUserActiveGame } from './userActiveGame';

export function handleGameInvite(challenger: IPlayer, opponent: IPlayer) {
  const gameId = crypto.randomUUID();
  const gameState = generateGameState(gameId, challenger, opponent, null, null);
  getAllGames().games[gameId] = gameState;
  console.log('Created Game: ', gameId);
  setTimeout(() => {
    if (!gameState.player1.ready || !gameState.player2.ready) {
      console.log('delete game: ', gameId);
      console.log("Because Players didn't join");
      const io = getIoInstance();
      if (gameState.player1.ready) {
        const userSocketId = getUserSocketId(gameState.player1.id!);
        if (userSocketId) io.to(userSocketId).emit('opponentDidNotJoin');
      }
      if (gameState.player2.ready) {
        const userSocketId = getUserSocketId(gameState.player2.id!);
        if (userSocketId) io.to(userSocketId).emit('opponentDidNotJoin');
      }
      removeUserActiveGame(gameState.player1.id, gameState.id);
      removeUserActiveGame(gameState.player2.id, gameState.id);
      delete getAllGames().games[gameId];
    }
  }, 30 * 1000);
  return gameId;
}
