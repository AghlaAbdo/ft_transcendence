import Image from "next/image"


export default function Table({players}) {
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
                    players.map((player, index) => 
                    <ul className="grid grid-cols-5 py-2 items-center rounded-[12px]
                        hover:bg-[#222e43]
                    " key={player.username}>
                        <li className="pl-2">{index + 1}</li>
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
            </div>
        </div>
    )
}
