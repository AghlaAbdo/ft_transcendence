import Badge from "@/components/leaderboard/Badge";
import { get_leaderboard } from "../lib/leaderboard";
import "./page.css"

export default async function Leaderboard() {
    const players = await get_leaderboard()
    return (
        <div>
            <Badge rank={1} showCrown={true} imgSrc={"/avatars/avatar1.png"} username={players[0].username} score={players[0].score} />
        </div> 
    )
}
