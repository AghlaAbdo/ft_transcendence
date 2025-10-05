'use client'

import PlayButton from "@/components/dashboard/button"
import BarChart from "@/components/dashboard/chart"
import PieChart from "@/components/dashboard/pie"
import Statistic from "@/components/dashboard/statistic"
import Statistics from "@/components/dashboard/statistics"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { GetGames } from "@/app/(protected)/lib/dashboard"
import { game } from "@/constants/dashboard"

export default function Dashboard() {
    const [allGames, setAllGames] = useState<game[]>([])
    const [visibleGames, setVisibleGames] = useState<game[]>([])
    const [loading, setLoading] = useState(1)
    const loadRef = useRef<HTMLDivElement>(null)
    const currentOffset = useRef(0)
    const limit = 15

    const loadMore = useCallback(() => {
        if (currentOffset.current >= allGames.length) {
            setLoading(3)
            return
        };
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
            setLoading(0)
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
        loading === 1 ? (
            <div className="flex justify-center items-center h-[100vh]">
                <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-blue-500 2xl:h-30 2xl:w-30 2xl:border-b-4"></div>
            </div>
        ) : (
            <div className="flex flex-col">
                {/* up */}
                <div className="flex">
                    {/* up left */}
                    <div className="relative h-[40vh] overflow-hidden rounded-[10px] m-2 ml-5 w-[30%] group">
                        <Image
                            src="/images/board.jpg"
                            alt="board"
                            fill
                            className="object-cover opacity-30 transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute flex flex-col items-center w-full top-[30%] px-4">
                            <p className="mb-3 font-bold text-white text-lg 2xl:text-[2.3rem]">
                                Ping Pong
                            </p>
                            <p className="text-gray-300 mb-6 text-[1rem] 2xl:text-[1.5rem] 2xl:mb-9">
                                Pick up your paddle, the table is waiting!
                            </p>
                            <PlayButton />
                        </div>

                    </div>
                    {/* up right  */}
                    <div className="h-[40vh] rounded-[10px] m-2 mr-5 w-[70%] bg-gray-800 overflow-y-auto custom-scrollbar-gray">
                        <h2 className="p-4 font-bold 2xl:text-[1.2rem]">OVERVIEW</h2>
                        <div className="flex items-center justify-baseline pl-10 2xl:mb-10">
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
                    <div className="h-[40vh] rounded-[10px] m-2 ml-5 mb-5 w-[30%]">
                        <BarChart />
                    </div>
                    {/* down right  */}
                    <div className="h-[40vh] rounded-[10px] m-2 mr-5 mb-5 w-[70%] bg-gray-800 overflow-y-hidden">
                        <div className="grid grid-cols-5 py-3 pr-5 justify-items-center border-b-1 border-gray-700">
                            <span className="2xl:text-[1.2rem]">Date & Time</span>
                            <span className="2xl:text-[1.2rem]">Opponent</span>
                            <span className="2xl:text-[1.2rem]">Type</span>
                            <span className="2xl:text-[1.2rem]">Score</span>
                            <span className="2xl:text-[1.2rem]">Result</span>
                        </div>
                        <div className="overflow-y-auto max-h-[80%] custom-scrollbar-gray 2xl:max-h-[80%]">
                            {visibleGames.map((game, index) => (
                                <div key={index} className={`grid grid-cols-5 p-3 justify-items-center items-center border-b border-gray-700 hover:bg-gray-700 transition-colors duration-100 ease-in-out`}>
                                    <span className="text-sm 2xl:text-[1.1rem]">{game.datetime.toLocaleDateString()} {game.datetime.toLocaleTimeString()}</span>
                                    <span className="2xl:text-[1.1rem]">{game.opponent}</span>
                                    <span className="capitalize border-1 border-[#D97706] text-[#D97706] rounded-[8px] px-2 py-1 text-[.6rem] w-[65px] text-center 2xl:text-[.9rem] 2xl:w-[100px]">{game.type}</span>
                                    <span className="2xl:text-[1.1rem]">{game.score1} - {game.score2}</span>
                                    <span className={`px-2 py-1 rounded text-white text-[.6rem] w-[50px] text-center h-fit 2xl:text-[.9rem] ${game.score1 > game.score2 ? 'bg-green-600 ' : 'bg-red-600'}`}>
                                        {game.score1 > game.score2 ? 'WIN' : 'LOSS'}
                                    </span>
                                </div>
                            ))}
                            {(!loading && loading !== 3) && (
                                <div ref={loadRef} className="text-center">Loading...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )

    )
}