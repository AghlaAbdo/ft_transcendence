'use client'

import Badge from "@/components/leaderboard/Badge";
import Table from "@/components/leaderboard/Table";
import { Player } from "@/constants/leaderboard";
export default function LeaderboardClient({
    players,
    topPlayers,
    numOfPlayers,
    page,
    numOfPages
}: {
    players: Player[];
    topPlayers: Player[];
    numOfPlayers: number;
    page: number;
    numOfPages: number;
}) {
    const widthMap: Map<number, number> = new Map()
    widthMap.set(1, 30)
    widthMap.set(2, 30)
    widthMap.set(3, 50)
    return (
        <div className="w-[90%] m-auto">
            <h1 className="text-center text-[2rem] mb-5">Leaderboard</h1>
            <div className={`flex items-end w-[${widthMap.get(topPlayers.length)}%] mx-auto`}>

                {
                    numOfPlayers > 1 ? (
                        <Badge color={"orange-500"} showCrown={false} imgSrc={"/avatars/avatar2.png"} username={topPlayers[1].username} score={topPlayers[1].score} rank={2} />
                    ) :
                        (<></>)
                }
                {
                    numOfPlayers > 0 ? (
                        <Badge color={"yellow-500"} showCrown={true} imgSrc={"/avatars/avatar1.png"} username={topPlayers[0].username} score={topPlayers[0].score} rank={1} />
                    ) :
                        (<></>)
                }
                {
                    numOfPlayers > 2 ? (
                        <Badge color={"gray-500"} showCrown={false} imgSrc={"/avatars/avatar4.png"} username={topPlayers[2].username} score={topPlayers[2].score} rank={3} />
                    ) :
                        (<></>)
                }
            </div>
            <Table players={players} numOfPages={numOfPages} page={page} />
        </div>
    )
}
