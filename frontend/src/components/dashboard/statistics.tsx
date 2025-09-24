

interface StatisticsProps {
    label: string;
    value: number;
}

export default function Statistics({
    label,
    value
}: StatisticsProps) {
    return (
        <div className="flex flex-col ml-4 mb-4 items-start px-6 py-1 bg-gray-900 w-[28%] rounded-r-[20px] shadow-md relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-transparent"></div>
            <p className="text-gray-300">{label}</p>
            <p className="font-bold text-[1.1rem]">{value}</p>
        </div>
    )
}