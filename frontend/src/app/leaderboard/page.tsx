import Badge from "@/components/leaderboard/Badge";
import { get_leaderboard } from "../lib/leaderboard";
import "./page.css"
import Table from "@/components/leaderboard/Table";

export default async function Leaderboard() {
    const players = await get_leaderboard()
    players.sort((a, b) => b.score - a.score)
    return (
        <div>
            <div className="flex items-end w-1/2 mx-auto">
                <Badge color={"orange-500"} rank={1} showCrown={false} imgSrc={"/avatars/avatar1.png"} username={players[1].username} score={players[1].score} rank={2} />
                <Badge color={"yellow-500"} rank={1} showCrown={true} imgSrc={"/avatars/avatar2.png"} username={players[0].username} score={players[0].score} rank={1}/>
                <Badge color={"gray-500"} rank={1} showCrown={false} imgSrc={"/avatars/avatar4.png"} username={players[2].username} score={players[2].score} rank={3}/>
            </div>
            <Table players={players}/>
        </div> 
    )
}
