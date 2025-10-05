import { fetchUser } from '../api/userService';
import { IPlayer } from '../types/types';

export async function getPlayerInfo(userId: string): Promise<IPlayer> {
  const response = await fetchUser(userId);
  const user = response.user;
  // console.log("user in getPlayerInfo: ", user);

  return {
    id: String(user.id),
    socketId: '',
    username: user.username,
    avatar: user.avatar_url,
    frame: 'silver2',
    level: '17',
  };
}
