import { Player } from "@/constants/leaderboard";

export async function get_all_leaderboard(): Promise<Player[]> {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failure fetching leaderboard!')
        const rawData = await response.json()
        const players = rawData.users

        const playersData: Player[] = players.map((user: Player, index: number) => {
            const games = user.wins + user.losses
            const winrate = games > 0 ? Math.round((user.wins / games) * 100) : 0
            return {
                ...user,
                rank: index + 1,
                games,
                winrate
            }
        })

        return playersData
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return []
    }
}

export function get_top_players(players: Player[]): Player[] {
    return players.slice(0, 3)
}

export function get_paginated_players(players: Player[], page: number, limit: number): Player[] {
    const start = (page - 1) * limit
    const end = start + limit
    return players.slice(start, end)
}
