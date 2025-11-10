import { TimeDict } from "@/constants/dashboard";


interface StatisticsProps {
    label: string;
    value?: number;
    total_stats?: TimeDict;
    avg_stats?: TimeDict;
    longest_stats?: TimeDict;
}

export default function Statistics({
    label,
    value,
    total_stats,
    avg_stats,
    longest_stats
}: StatisticsProps) {
    return (
        <div className="flex flex-col ml-4 mb-4 items-start px-6 py-1 2xl:py-2 bg-gray-900 w-[28%] rounded-r-[20px] shadow-md relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-transparent"></div>
            <p className="text-gray-300 2xl:text-[1.3rem]">{label}</p>
            {
                value && (
                    <p className="font-bold text-[1.1rem] 2xl:text-[1.3rem]">{value}</p>
                )
            }
            {
                total_stats && (
                    <div>
                        {total_stats.days > 0 && <span>{total_stats.days}<i className="text-gray-300 text-[.8rem]">d</i> </span>}
                        {total_stats.hours > 0 && <span>{total_stats.hours}<i className="text-gray-300 text-[.8rem]">h</i> </span>}
                        {total_stats.minutes > 0 && <span>{total_stats.minutes}<i className="text-gray-300 text-[.8rem]">m</i> </span>}
                        <span>{total_stats.seconds}<i className="text-gray-300 text-[.8rem]">s</i></span>
                    </div>
                )
            }
            {
                
                avg_stats && (
                    <div>
                        {avg_stats.days > 0 && <span>{avg_stats.days}<i className="text-gray-300 text-[.8rem]">d</i> </span>}
                        {avg_stats.hours > 0 && <span>{avg_stats.hours}<i className="text-gray-300 text-[.8rem]">h</i> </span>}
                        {avg_stats.minutes > 0 && <span>{avg_stats.minutes}<i className="text-gray-300 text-[.8rem]">m</i> </span>}
                        <span>{avg_stats.seconds}<i className="text-gray-300 text-[.8rem]">s</i></span>
                    </div>
                )
            }
            {
                
                longest_stats && (
                    <div>
                        {longest_stats.days > 0 && <span>{longest_stats.days}<i className="text-gray-300 text-[.8rem]">d</i> </span>}
                        {longest_stats.hours > 0 && <span>{longest_stats.hours}<i className="text-gray-300 text-[.8rem]">h</i> </span>}
                        {longest_stats.minutes > 0 && <span>{longest_stats.minutes}<i className="text-gray-300 text-[.8rem]">m</i> </span>}
                        <span>{longest_stats.seconds}<i className="text-gray-300 text-[.8rem]">s</i></span>
                    </div>
                )
            }
        </div>
    )
}