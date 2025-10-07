import { games } from "@/mocks/dashboard"
import { game, stat, StatWithTimeDict, TimeDict } from "@/constants/dashboard"
import { statSync } from "fs"

export async function GetGames(userId: number): Promise<game[]> {
    const response = await fetch(`/api/game/games?userId=${userId}`)
    if (!response.ok) throw new Error("Error fetching games!")
    const rawData = await response.json()
    const games: game[] = rawData.games
    const updatedGames = games.map(game =>
        userId !== game.player1_id ? {
            ...game,
            player1_id: game.player2_id,
            player2_id: game.player1_id,
            player1_score: game.player2_score,
            player2_score: game.player1_score,
        } : game
    )
    return updatedGames
}

function secondsToTimeDict(totalSeconds: number): TimeDict {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return { days, hours, minutes, seconds };
}

export async function GetStats(userId: number): Promise<StatWithTimeDict> {
    const response = await fetch(`/api/game/stats?userId=${userId}`)
    if (!response.ok) throw new Error("Error fetching stats!")
    const rawData = await response.json()
    const stats: stat = rawData.stats
    return {
        total_play_time: secondsToTimeDict(stats.total_play_time),
        avg_play_time: secondsToTimeDict(stats.avg_play_time),
        longest_play_time: secondsToTimeDict(stats.longest_play_time)
    };
}
