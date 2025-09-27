import Image from "next/image"
import Link from "next/link"

export default function Table({players, numOfPages, page}) {
    return (
        <div className="m-10">
            <div className="
            bg-[#1D293D] border-1 border-[#45556C]
            p-5 rounded-[15px] text-[.9rem]
            ">
                <div className="grid grid-cols-5 text-[#7f8ea3] mb-3">
                    <span>Rank</span>
                    <span>Player</span>
                    <span>Rating</span>
                    <span>Winrate</span>
                    <span>Games</span>
                </div>
                {
                    players.map((player) => 
                    <ul className="grid grid-cols-5 py-2 items-center rounded-[12px]
                        hover:bg-[#222e43]
                    " key={player.username}>
                        <li className="pl-2">{player.rank}</li>
                        <div className="flex items-center">
                            <Image
                            src="/avatars/avatar1.png"
                            alt="crown"
                            width={30}
                            height={30}
                            />
                            <li className="pl-3">{player.username}</li>
                        </div>
                        <li className="w-fit px-2 bg-[#27344b] border-1 border-[#45556C] rounded-[12px]">{player.score} RP</li>
                        <li>{player.winrate} %</li>
                        <li>{player.games}</li>
                    </ul>
                    )
                }
                {
                    numOfPages > 1 && (
                        <div className="mx-auto flex justify-between w-fit mx-auto mt-5 items-center">
                            <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                flex items-center justify-center font-bold
                                rounded-[4px] hover:bg-gray-400
                            " 
                            href={`leaderboard/?page=${1}`}>{"<<"}</Link>
                            {
                                page > 1 ? (
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${page - 1}`}>&lt;</Link>
                                ):
                                (
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${1}`}>&lt;</Link>
                                )
                            }
                            <Link className="m-1 bg-[#9333EA] p-2 w-[30px] h-[30px] 
                                flex items-center justify-center font-bold
                                rounded-[4px]
                            " 
                            href={`leaderboard/?page=${page}`}>{page}</Link>
                            {
                                page + 1 < numOfPages ? (
                                    <>
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${page + 1}`}>{page + 1}</Link>
                                    <span className="w-[30px] text-center">...</span>
                                    </>
                                ): (
                                    <></>
                                )
                            }
                            {
                                page < numOfPages ? (
                               <>
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${numOfPages}`}>{numOfPages}</Link>
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${page + 1}`}>&gt;</Link>
                               </>
                            ):(
                                    <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                    flex items-center justify-center font-bold
                                    rounded-[4px] hover:bg-gray-400
                                    " 
                                    href={`leaderboard/?page=${numOfPages}`}>&gt;</Link>
                                )
                            }
                            <Link className="m-1 bg-gray-500 p-2 w-[30px] h-[30px] 
                                flex items-center justify-center font-bold
                                rounded-[4px] hover:bg-gray-400
                            " 
                            href={`leaderboard/?page=${numOfPages}`}>{">>"}</Link>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
