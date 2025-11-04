'use client'

import Badge from "@/components/leaderboard/Badge";
import { get_all_leaderboard, get_top_players, get_paginated_players } from "../lib/leaderboard";
import Table from "@/components/leaderboard/Table";
import { useEffect, useState, useMemo, use } from "react";
import { Player, PlayerWithRank } from "@/constants/leaderboard";


export default function Leaderboard({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const resolvedSearchParams = use(searchParams)
    const [allPlayers, setAllPlayers] = useState<PlayerWithRank[]>([])
    const [loading, setLoading] = useState(true)
    const widthMap: Map<number, number> = new Map()
    widthMap.set(1, 30)
    widthMap.set(2, 30)
    widthMap.set(3, 50)
    const limit = 20
    const page = Number(resolvedSearchParams.page) || 1

    const numOfPlayers = allPlayers.length
    const numOfPages = Math.ceil(numOfPlayers / limit)
    console.log(numOfPlayers)

    const topPlayers = useMemo(() => get_top_players(allPlayers), [allPlayers])
    const players = useMemo(() => get_paginated_players(allPlayers, page, limit), [allPlayers, page, limit])

    useEffect(() => {
        async function getLeaderboard() {
            const allPlayersData = await get_all_leaderboard()
            setAllPlayers(allPlayersData)
            setLoading(false)
        }
        getLeaderboard()
    }, [])
    return (
        loading ? (
            <div className="flex justify-center items-center h-[100vh]">
                <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-blue-500 2xl:h-30 2xl:w-30 2xl:border-b-4"></div>
            </div>
        ) : (

            <div className="w-[90%] m-auto">
                <h1 className="text-center text-[2rem] mb-5">Leaderboard</h1>
                <div className={`flex items-end w-[${widthMap.get(topPlayers.length)}%] mx-auto justify-between`}>

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
    )
}