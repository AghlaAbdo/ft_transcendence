'use client'

import Badge from "@/components/leaderboard/Badge";
import { get_all_leaderboard, get_top_players, get_paginated_players } from "../lib/leaderboard";
import Table from "@/components/leaderboard/Table";
import { useEffect, useState, useMemo, use } from "react";
import { Player } from "@/constants/leaderboard";


export default function Leaderboard({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const resolvedSearchParams = use(searchParams)
    const [allPlayers, setAllPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)
    const widthMap: Map<number, number> = new Map()
    widthMap.set(1, 30)
    widthMap.set(2, 30)
    widthMap.set(3, 50)
    const limit = 25
    const page = Number(resolvedSearchParams.page) || 1

    const numOfPlayers = allPlayers.length
    const numOfPages = Math.ceil(numOfPlayers / limit)

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

            <div className="w-[80%] mx-auto mt-30 min-w-6xl">
                <h1 className="text-center text-[2rem] mb-10">Leaderboard</h1>
                <div className={`flex items-end w-[${widthMap.get(topPlayers.length)}%] mx-auto justify-center mb-20`}>

                    {
                        numOfPlayers > 1 ? (
                            <Badge color={"orange-500"} showCrown={false} imgSrc={topPlayers[1].avatar_url} username={topPlayers[1].username} score={topPlayers[1].points} rank={2} />
                        ) :
                            (<></>)
                    }
                    {
                        numOfPlayers > 0 ? (
                            <Badge color={"yellow-500"} showCrown={true} imgSrc={topPlayers[0].avatar_url} username={topPlayers[0].username} score={topPlayers[0].points} rank={1} />
                        ) :
                            (<></>)
                    }
                    {
                        numOfPlayers > 2 ? (
                            <Badge color={"gray-500"} showCrown={false} imgSrc={topPlayers[2].avatar_url} username={topPlayers[2].username} score={topPlayers[2].points} rank={3} />
                        ) :
                            (<></>)
                    }
                </div>
                <Table players={players} numOfPages={numOfPages} page={page} />
            </div>
        )
    )
}