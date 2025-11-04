import crypto from 'crypto';
import { IPlayer } from '../types/types';
import { generateGameState } from './gameState';
import { getAllGames } from './AllGames';

export function handleGameInvite(challenger: IPlayer, opponent: IPlayer) {
  const gameId = crypto.randomUUID();
  const gameState = generateGameState(gameId, challenger, opponent, null, null);
  getAllGames().games[gameId] = gameState;
  console.log('Created Game: ', gameId);
  setTimeout(() => {
    if (!gameState.player1.ready || !gameState.player2.ready) {
      console.log('delete game: ', gameId);
      console.log("Because Players didn't join");
    }
    delete getAllGames().games[gameId];
  }, 20 * 1000);
  return gameId;
}
