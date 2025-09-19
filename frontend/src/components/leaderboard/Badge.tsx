import Image from "next/image"

export default function Badge({imgSrc, rank}) {
    return (
    <div className="relative w-fit">
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
    )
}
