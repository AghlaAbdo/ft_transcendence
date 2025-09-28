import Image from "next/image"

export default function Badge({imgSrc, rank, username, score, showCrown, color, imageSrc}) {
  const position = rank !== 1 ? "transfrom translate-y-5" : "";
    return (
    <div className={`flex flex-col items-center w-fit mx-auto ${position}`}>
      {
        showCrown && (
          <div className="w-fit">
        <Image
        src={"/icons/crown.svg"}
        alt="crown"
        width={40}
        height={40}
      />
      </div>
        )
      }
      <div className="relative w-fit flex flex-col items-center">
        <div className={`rounded-full border-4 border-${color} overflow-hidden`}>
          <Image
            src={imgSrc}
            alt="Winner"
            width={120}
            height={120}
          />
        </div>
        <span className={`
          absolute 
          left-1/2 top-full 
          w-12 h-12 
          -translate-x-1/2 -translate-y-1/2
          flex items-center justify-center
          rounded-full 
          bg-${color} text-white font-bold
        `}>
          {rank}
        </span>
      </div>
      <div className="mt-7 flex flex-col items-center">
        <span className="2xl:text-[1.1rem]">{username}</span>
        <span className="mt-1 text-[.8rem] bg-[#1D293D] border-1 border-[#45556C] px-2 py-1 rounded-[12px] 2xl:text-[.9rem]">{score} RP</span>
      </div>
    </div>
    )
}
