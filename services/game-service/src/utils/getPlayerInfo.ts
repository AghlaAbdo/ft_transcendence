import { fetchUser } from '../api/userService';
import { IPlayer } from '../types/types';

export async function getPlayerInfo(userId: string): Promise<IPlayer | null> {
  const response = await fetchUser(userId);
  if (!response) return null;
  const user = response.user;
  // console.log('user in getPlayerInfo: ', user);

  return {
    id: String(user.id),
    username: user.username,
    avatar: user.avatar_url,
    // frame: 'silver2',
    level: user.level,
    points: user.points,
    isEliminated: false,
  };
}
