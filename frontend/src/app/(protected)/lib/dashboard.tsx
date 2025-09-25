import { games } from "@/mocks/dashboard"
import { game } from "@/constants/dashboard"

export async function GetGames(): Promise<game[]> {
    return games
}
