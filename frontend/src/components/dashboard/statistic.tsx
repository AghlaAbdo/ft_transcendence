

interface StatisticsProps {
    label: string;
    value: number;
    color: string;
}

export default function Statistic({
    label,
    value,
    color
}: StatisticsProps) {
    return (
        <div className="flex flex-col items-start pl-3 ml-10 relative w-fit">
            <div className={`absolute top-0 left-0 w-1 h-full ${color} rounded-[12px]`}></div>
            <p className="font-bold text-[1.1rem] 2xl:text-[1.3rem] 2xl:ml-2">{value}</p>
            <p className="text-gray-300 2xl:text-[1.2rem] 2xl:ml-2">{label}</p>
        </div>
    )
}
