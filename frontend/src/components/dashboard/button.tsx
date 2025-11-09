import Link from "next/link"


export default function PlayButton() {
    return (
        <Link href='/game'
            className="bg-[#9333EA] font-bold px-8 py-2 
            rounded-[10px] hover:bg-[#A855F7] text-[1.3rem] 2xl:text-[2rem] 2xl:px-16 2xl:py-3
            transition-colors duration-300 ease-in-out
            "
        >
            Play
        </Link>
    )
}