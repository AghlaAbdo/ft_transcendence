import { TruckElectric } from "lucide-react"
import Image from "next/image"

export default function Badge({imgSrc, rank, username, score, showCrown}) {
    return (
    <div className="flex flex-col items-center w-fit">
      {
        showCrown && (
          <div className="w-fit">
        <Image
        src="/icons/crown.svg"
        alt="crown"
        width={40}
        height={40}
      />
      </div>
        )
      }
      <div className="relative w-fit flex flex-col items-center">
        <div className="rounded-full border-4 border-yellow-500 overflow-hidden">
          <Image
            src="/avatars/avatar1.png"
            alt="Winner"
            width={120}
            height={120}
          />
        </div>
        <span className="
          absolute 
          left-1/2 top-full 
          w-12 h-12 
          -translate-x-1/2 -translate-y-1/2
          flex items-center justify-center
          rounded-full 
          bg-yellow-500 text-white font-bold
        ">
          1
        </span>
      </div>
      <div className="mt-7 flex flex-col items-center">
        <span>{username}</span>
        <span className="mt-1 text-[.8rem] bg-[#1D293D] border-1 border-[#45556C] px-2 py-1 rounded-[12px]">{score} RP</span>
      </div>
    </div>
    )
}
