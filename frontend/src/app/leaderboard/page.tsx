import Badge from "@/components/leaderboard/Badge";
import { get_leaderboard } from "../lib/leaderboard";
import "./page.css"

export default async function Leaderboard() {
    const players = await get_leaderboard()

    return (
        <div>
            <Badge rank={1} imgSrc={"/avatars/avatar1.png"} />
        </div> 
    )
}
