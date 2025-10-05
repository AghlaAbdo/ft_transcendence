import { Player } from "@/constants/leaderboard";
import { Players } from "@/mocks/leaderboard";

interface PlayerWithRank extends Player {
    rank: number;
}

const is_mock = false

export async function get_all_leaderboard(): Promise<PlayerWithRank[]> {
    if (is_mock) {
        const sorted = Players.sort((a, b) => b.score - a.score)
        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1
        }))
    }

    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failure fetching leaderboard!')
        const rawData = await response.json()
        const players = rawData.users

        const playersData: Player[] = players.map((user: any) => {
            const wins = user.wins || 0
            const losses = user.losses || 0
            const totalGames = wins + losses
            const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

            return {
                username: user.username,
                score: user.points || 0,
                winrate: winrate,
                games: totalGames,
                avatar_url: user.avatar_url
            }
        })

        const sortedPlayers = playersData.sort((a, b) => b.score - a.score)

        return sortedPlayers.map((player, index) => ({
            ...player,
            rank: index + 1
        }))
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        throw new Error('Failed to fetch leaderboard data')
    }
}

export function get_top_players(players: PlayerWithRank[]): PlayerWithRank[] {
    return players.slice(0, 3)
}

export function get_paginated_players(players: PlayerWithRank[], page: number, limit: number): PlayerWithRank[] {
    const start = (page - 1) * limit
    const end = start + limit
    return players.slice(start, end)
}
