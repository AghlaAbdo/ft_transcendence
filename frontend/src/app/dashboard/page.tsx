'use client'

import PlayButton from "@/components/dashboard/button"
import BarChart from "@/components/dashboard/chart"
import PieChart from "@/components/dashboard/pie"
import Statistic from "@/components/dashboard/statistic"
import Statistics from "@/components/dashboard/statistics"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { GetGames } from "@/app/lib/dashboard"
import { game } from "@/constants/dashboard"

export default function Dashboard() {
    const [allGames, setAllGames] = useState<game[]>([])
    const [visibleGames, setVisibleGames] = useState<game[]>([])
    const [loading, setLoading] = useState(true)
    const loadRef = useRef<HTMLDivElement>(null)
    const currentOffset = useRef(0)
    const limit = 15

    const loadMore = useCallback(() => {
        if (currentOffset.current >= allGames.length) return;
        const nextOffset = Math.min(currentOffset.current + limit, allGames.length);
        setVisibleGames(allGames.slice(0, nextOffset));
        currentOffset.current = nextOffset;
        console.log("load more", nextOffset);
    }, [allGames, limit]);
    useEffect(() => {
        async function getGames() {
            const games: game[] = await GetGames()
            setAllGames(games)
            setVisibleGames(games.slice(0, limit))
            currentOffset.current = limit
            setLoading(false)
            console.log("getgames")
        }
        getGames()
    }, [])
    useEffect(() => {
        console.log("observer start")
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0 }
        );

        if (loadRef.current) observer.observe(loadRef.current);

        return () => {
            observer.disconnect();
        };
    }, [loadMore, loading]);
    return (
        <div className="flex flex-col">
            {/* up */}
            <div className="flex">
                {/* up left */}
                <div className="relative h-[50vh] overflow-hidden rounded-[10px] m-2 ml-5 w-[30%] group">
                    <Image
                        src="/images/board.jpg"
                        alt="board"
                        fill
                        className="object-cover opacity-30 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute flex flex-col items-center w-[100%] top-[30%]">
                        <p className="mb-3 font-bold text-white text-[1.2rem]">Ping Pong</p>
                        <p className="text-gray mb-15">Pick up your paddle, the table is waiting!</p>
                        <PlayButton />
                    </div>
                </div>
                {/* up right  */}
                <div className="h-[50vh] rounded-[10px] m-2 mr-5 w-[70%] bg-gray-800">
                    <h2 className="p-4 font-bold">OVERVIEW</h2>
                    <div className="flex items-center justify-baseline pl-10">
                        <PieChart />
                        <Statistic label="WINS" value={25} color="bg-green" />
                        <Statistic label="LOSE" value={30} color="bg-red" />
                    </div>
                    <div className="flex flex-wrap mt-4 justify-around">
                        <Statistics label="Total games" value={87} />
                        <Statistics label="Total games" value={87} />
                        <Statistics label="Total games" value={87} />
                        <Statistics label="Total games" value={87} />
                        <Statistics label="Total games" value={87} />
                        <Statistics label="Total games" value={87} />
                    </div>
                </div>
            </div>
            {/* down */}
            <div className="flex">
                {/* down left */}
                <div className="h-[50vh] rounded-[10px] m-2 ml-5 mb-5 w-[30%]">
                    <BarChart />
                </div>
                {/* down right  */}
                <div className="h-[50vh] rounded-[10px] m-2 mr-5 mb-5 w-[70%] bg-gray-800">
                    <div className="grid grid-cols-5 py-3 pr-5 justify-items-center border-b-1 border-gray-700">
                        <span>Date & Time</span>
                        <span>Opponent</span>
                        <span>Type</span>
                        <span>Score</span>
                        <span>Result</span>
                    </div>
                    <div className="overflow-y-auto max-h-[70%] custom-scrollbar-gray">
                        {visibleGames.map((game, index) => (
                            <div key={index} className="grid grid-cols-5 p-3 justify-items-center border-b border-gray-700 hover:bg-gray-700 transition-colors">
                                <span className="text-sm">{game.datetime.toLocaleDateString()} {game.datetime.toLocaleTimeString()}</span>
                                <span>{game.opponent}</span>
                                <span className="capitalize border-1 border-[#D97706] text-[#D97706] rounded-[8px] px-2 py-1 text-[.6rem] w-[65px] text-center">{game.type}</span>
                                <span>{game.score1} - {game.score2}</span>
                                <span className={`px-2 py-1 rounded text-white text-[.6rem] w-[50px] text-center ${game.score1 > game.score2 ? 'bg-green-600 ' : 'bg-red-600'}`}>
                                    {game.score1 > game.score2 ? 'WIN' : 'LOSS'}
                                </span>
                            </div>
                        ))}
                        {!loading && (
                            <div ref={loadRef}></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
