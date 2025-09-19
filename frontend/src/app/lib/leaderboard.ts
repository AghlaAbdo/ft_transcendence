import { Player } from "@/constants/leaderboard";
import { Players } from "@/mocks/leaderboard";


const is_mock = true

export async function get_leaderboard(): Promise<Player[]> {
    if (is_mock){
        return Players
    }

    const res = await fetch('http://localhost:4000/leaderboard');
    if (!res.ok) throw new Error('Failure fetching leaderboard!')
    return res.json()
}

