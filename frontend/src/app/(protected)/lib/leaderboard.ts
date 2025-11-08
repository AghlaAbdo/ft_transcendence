import { Player } from "@/constants/leaderboard";
// import { Players } from "@/mocks/leaderboard";


// const is_mock = false

export async function get_all_leaderboard(): Promise<Player[]> {
    // if (is_mock) {
    //     const sorted = Players.sort((a, b) => b.score - a.score)
    //     return sorted.map((player, index) => ({
    //         ...player,
    //         rank: index + 1
    //     }))
    // }

    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failure fetching leaderboard!')
        const rawData = await response.json()
        const players = rawData.users

        const playersData: Player[] = players.map((user: any) => {
            // const wins = user.wins || 0
            // const losses = user.losses || 0
            const games = user.wins + user.losses
            const winrate = games > 0 ? Math.round((user.wins / games) * 100) : 0

            return {
                ...user,
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

// export function get_user_by_username(players: PlayerWithRank[], username: string): PlayerWithRank {
//     const user = players.find(player => player.username === username)
//     if (!user) {
//         throw new Error(`User '${username}' not found in leaderboard`)
//     }
//     return user
// }
