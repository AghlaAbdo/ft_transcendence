import { fetchUser } from "../api/userService";
import { IPlayer } from "../types/game";

export async function getPlayerInfo(userId: string): Promise<IPlayer> {
    const response = await fetchUser(userId);
    const user = response.user;
    console.log("user in getPlayerInfo: ", user);

    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar_url,
        frame: 'silver2',
        level: '17',
    }
}