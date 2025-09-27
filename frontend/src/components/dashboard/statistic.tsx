

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
        <div className="flex flex-col items-start pl-3 ml-10 w-[25%] relative w-fit">
            <div className={`absolute top-0 left-0 w-1 h-full ${color} rounded-[12px]`}></div>
            <p className="font-bold text-[1.1rem]">{value}</p>
            <p className="text-gray-300">{label}</p>
        </div>
    )
}
