import { games } from "@/mocks/dashboard"
import { game } from "@/constants/dashboard"

export async function GetGames(): Promise<game[]> {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    await sleep(3000)
    return games
}
