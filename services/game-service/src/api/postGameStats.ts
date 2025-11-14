import { IGameState } from '../types/types';
import { USER_SERVICE_HOST, INTERNAL_API_KEY } from '../config/env';

const postGameStats = async (gameState: IGameState) => {
  const player1Id = gameState.player1.id;
  const player2Id = gameState.player2.id;
  const winnerId = gameState.winner_id;
  const loserId = winnerId === player1Id ? player2Id : player1Id;

  try {
    if (!INTERNAL_API_KEY) return;
    const url = `${USER_SERVICE_HOST}/api/users/update-stats`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        winnerId,
        loserId,
        // playtime: gameState.playtime,
      }),
    });

    const data: { status: boolean; message: string } = await response.json();

    if (!response.ok || data.status === false) {
      console.log('Error while updating stats : ', data.message);
      return;
    }
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
};

export default postGameStats;
