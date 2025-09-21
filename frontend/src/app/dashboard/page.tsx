import PlayButton from "@/components/leaderboard/button"
import Image from "next/image"

export default function dashboard() {
    return (
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
                    <div className="absolute flex flex-col items-center w-[100%] top-[20%]">
                        <p className="mb-3 font-bold text-white text-[1.2rem]">Ping Pong</p>
                        <p className="text-gray mb-15">Pick up your paddle, the table is waiting!</p>
                        <PlayButton/>
                    </div>
                </div>
                {/* up right  */}
                <div className="h-[40vh] rounded-[6px] m-2 mr-5 w-[70%] border-1 border-red-500">up right</div>
            </div>
            {/* down */}
            <div className="flex">
                {/* down left */}
                <div className="h-[40vh] rounded-[6px] m-2 ml-5 mb-5 w-[30%] border-1 border-red-500">down left</div>
                {/* down right  */}
                <div className="h-[40vh] rounded-[6px] m-2 mr-5 mb-5 w-[70%] border-1 border-red-500">down right</div>
            </div>
        </div>
    )
}
