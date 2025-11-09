// import { games } from "@/mocks/dashboard"
import { game, stat, StatWithTimeDict, TimeDict, WeekStats } from "@/constants/dashboard"

export async function GetGames(userId: number): Promise<game[]> {
    // const empty = false
    // if (empty) {
    //     userId = 1000
    // }
    const response = await fetch(`/api/game/games?userId=${userId}`)
    if (!response.ok) throw new Error("Error fetching games!")
    const rawData = await response.json()
    const games: game[] = rawData.games
    const updatedGames = games.map(game =>
        userId !== game.player1_id ? {
            ...game,
            play_time_dict: secondsToTimeDict(game.play_time),
            player1_id: game.player2_id,
            player2_id: game.player1_id,
            player1_score: game.player2_score,
            player2_score: game.player1_score,
        } : {
            ...game,
            play_time_dict: secondsToTimeDict(game.play_time)
        }
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

export async function GetWeekStats(userId: number): Promise<WeekStats[]> {
    const response = await fetch(`/api/game/weekly_stats?userId=${userId}`)
    if (!response.ok) throw new Error("Error fetching weekly stats!")
    const rawData = await response.json()
    // console.log(rawData.stats)
    const stats: WeekStats[] = rawData.stats.map((stat: WeekStats) => ({
        week: stat.week,
        games_played: stat.games_played,
        range: stat.range
    }))
    return stats
}
