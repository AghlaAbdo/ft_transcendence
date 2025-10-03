import LeaderboardClient from "@/components/leaderboard/leaderboard";
import { Player } from "@/constants/leaderboard";
import { get_leaderboard } from "@/app/(protected)/lib/leaderboard";

export default async function Leaderboard({
    searchParams,
}: {
    searchParams: { page?: string }
}) {
    const limit = 20
    const page: number = Number(searchParams?.page) || 1
    const numOfPlayers = 50
    const numOfPages = Math.ceil(numOfPlayers / limit)
    const offset = (page - 1) * limit
    const players: Player[] = await get_leaderboard(page, offset, false)
    const topPlayers: Player[] = await get_leaderboard(page, offset, true)
    return (
        <LeaderboardClient players={players} topPlayers={topPlayers} numOfPlayers={numOfPlayers} page={page} numOfPages={numOfPages}/>
    )
}
