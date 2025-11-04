'use client'

import PlayButton from "@/components/dashboard/button"
import BarChart from "@/components/dashboard/chart"
import PieChart from "@/components/dashboard/pie"
import Statistic from "@/components/dashboard/statistic"
import Statistics from "@/components/dashboard/statistics"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { GetGames, GetStats, GetWeekStats } from "@/app/(protected)/lib/dashboard"
import { game, stat, StatWithTimeDict, WeekStats } from "@/constants/dashboard"
import { PlayerWithRank } from "@/constants/leaderboard"
import { get_all_leaderboard, get_user_by_username } from "../lib/leaderboard"
import { useAuth } from "@/hooks/useAuth"



export default function Dashboard() {
    const { user: authUser, isLoading: authLoading } = useAuth()
    const [allGames, setAllGames] = useState<game[]>([])
    const [visibleGames, setVisibleGames] = useState<game[]>([])
    const [stats, setStats] = useState<StatWithTimeDict>()
    const [weeklyStats, setWeeklyStats] = useState<WeekStats[]>([])
    const [user, setUser] = useState<PlayerWithRank>()
    const [loading, setLoading] = useState(1)
    const loadRef = useRef<HTMLDivElement>(null)
    const currentOffset = useRef(0)
    const limit = 9
    const [observerStart, setObserverStart] = useState(false)

    const loadMore = () => {
        // console.log("here")
        if (currentOffset.current >= allGames.length) {
            return
        }
        setLoading(2)
        setTimeout(() => {
            const nextOffset = Math.min(currentOffset.current + limit, allGames.length);
            setVisibleGames(allGames.slice(0, nextOffset));
            currentOffset.current = nextOffset;
            setLoading(0)
        }, 1000)
    }
    useEffect(() => {
        async function getData() {
            if (!authUser || authLoading) return;

            const games: game[] = await GetGames(authUser.id)
            const stats: StatWithTimeDict = await GetStats(authUser.id)
            setStats(stats)
            const allPlayersData = await get_all_leaderboard()
            const weeklyStats: WeekStats[] = await GetWeekStats(authUser.id)
            setWeeklyStats(weeklyStats)
            // console.log(weeklyStats)
            const current_user = get_user_by_username(allPlayersData, authUser.username)!
            setUser(current_user)
            setAllGames(games)
            setVisibleGames(games.slice(0, limit))
            currentOffset.current = limit
            setLoading(0)
            setObserverStart(true)
        }
        getData()
    }, [authUser, authLoading])
    useEffect(() => {
        // console.log("observer") 
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
            observer.disconnect()
        }
    }, [observerStart]); 
    return (
        (loading === 1 || authLoading) ? (
            <div className="flex justify-center items-center h-[100vh]">
                <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-blue-500 2xl:h-30 2xl:w-30 2xl:border-b-4"></div>
            </div>
        ) : (
            <div className="flex flex-col">
                {/* up */}
                <div className="flex">
                    {/* up left */}
                    <div className="relative h-[50vh] overflow-hidden rounded-[10px] m-2 ml-5 w-[30%] group 2xl:h-[40vh]">
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
                    <div className="h-[50vh] rounded-[10px] m-2 mr-5 w-[70%] bg-gray-800 overflow-y-auto custom-scrollbar-gray 2xl:h-[40vh]">
                        <h2 className="p-4 font-bold 2xl:text-[1.2rem]">OVERVIEW</h2>
                        <div className="flex items-center pl-10 2xl:mb-10">
                            <PieChart user={user} />
                            <Statistic label="WINS" value={user.wins} color="bg-green" />
                            <Statistic label="LOSE" value={user.losses} color="bg-red" />
                        </div>
                        <div className="flex flex-wrap mt-4 justify-around">    
                            <Statistics label="Total games" value={user.games} />
                            <Statistics label="Rank" value={user.rank} />
                            <Statistics label="Points" value={user.score} />
                            <Statistics label="Total play time" total_stats={stats?.total_play_time} />
                            <Statistics label="Avg games duration" avg_stats={stats?.avg_play_time} />
                            <Statistics label="Longest game" longest_stats={stats?.longest_play_time} />
                        </div>
                    </div>
                </div>
                {/* down */}
                <div className="flex">
                    {/* down left */}
                    <div className="h-[50vh] rounded-[10px] m-2 ml-5 mb-5 w-[30%] 2xl:h-[40vh]">
                        <BarChart weeklyStats={weeklyStats}/>
                    </div>
                    {/* down right  */}
                    <div className="h-[50vh] rounded-[10px] m-2 mr-5 mb-5 w-[70%] bg-gray-800 overflow-y-hidden flex flex-col 2xl:h-[40vh]">
                        <div className="grid grid-cols-5 py-3 pr-5 justify-items-center border-b-1 border-gray-700">
                            <span className="2xl:text-[1.2rem]">Date & Time</span>
                            <span className="2xl:text-[1.2rem]">Opponent</span>
                            <span className="2xl:text-[1.2rem]">Type</span>
                            <span className="2xl:text-[1.2rem]">Score</span>
                            <span className="2xl:text-[1.2rem]">Result</span>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar-gray">
                            {
                                visibleGames.length > 0 ? (
                                    visibleGames.map((game, index) => (
                                        <div key={index} className={`grid grid-cols-5 p-3 justify-items-center items-center border-b border-gray-700 hover:bg-gray-700 transition-colors duration-100 ease-in-out`}>
                                            <span className="text-sm 2xl:text-[1.1rem]">{new Date(game.played_at).toLocaleString()}</span>
                                            <span className="2xl:text-[1.1rem]">{game.player2_id}</span>
                                            <span className="capitalize border-1 border-[#D97706] text-[#D97706] rounded-[8px] px-2 py-1 text-[.6rem] w-[65px] text-center 2xl:text-[.9rem] 2xl:w-[100px]">{game.type}</span>
                                            <span className="2xl:text-[1.1rem]">{game.player1_score} - {game.player2_score}</span>
                                            <span className={`px-2 py-1 rounded text-white text-[.6rem] w-[50px] text-center h-fit 2xl:text-[.9rem] ${game.winner_id === game.player1_id ? 'bg-green-600 ' : 'bg-red-600'}`}>
                                                {game.winner_id === game.player1_id ? 'WIN' : 'LOSS'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="relative w-48 h-32 mb-4 2xl:mb-7 2xl:w-68 2xl:h-52">
                                            <Image
                                                src={'/images/games-history-placeholder.png'}
                                                alt="Games History"
                                                fill
                                            />
                                        </div>
                                        <p className="text-gray-400 text-center 2xl:text-[1.5rem]">
                                            No games played yet. Start your first match!
                                        </p>
                                    </div>
                                )
                            }
                            <div className="h-4" ref={loadRef}>
                                {loading === 2 && currentOffset.current < allGames.length && (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                    </div>
                                )}
                                {/* {loading !== 2 && currentOffset.current < allGames.length && (
                                    <div className="h-4"></div>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    )
}
