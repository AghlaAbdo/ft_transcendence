import { Player } from "@/constants/leaderboard";
import { Players } from "@/mocks/leaderboard";


const is_mock = true

export async function get_leaderboard(page, offset, onlyTop): Promise<Player[]> {
    const sorted = Players.sort((a, b) => b.score - a.score)
    if (onlyTop){
      return sorted.slice(0, 3)  
    } 
    const start = (page - 1) * 10
    const end = start + 10
    const sliced = Players.slice(start, end)
    if (is_mock){
        return sliced.map((player, index) => ({
            ...player,
            rank: index + 1 + start
        }))
    }

    const res = await fetch('http://localhost:4000/leaderboard');
    if (!res.ok) throw new Error('Failure fetching leaderboard!')
    return res.json()
}

