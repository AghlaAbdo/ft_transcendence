import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import { Player } from '@/constants/leaderboard';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface WinrateDoughnutChartProps {
    user: Player;
}

export default function DoughnutChart({
    user
}: WinrateDoughnutChartProps) {
    const data: ChartData<'doughnut'> = {
        labels: user.games === 0 ? ['No Data'] : ['Wins', 'Losses'],
        datasets: [
            {
                data: user.games === 0 ? [1] : [user.wins, user.losses],
                backgroundColor: user.games === 0
                    ? ['rgba(107, 114, 128, 0.8)']
                    : [
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(51, 65, 85, 0.8)',
                    ],
                borderColor: user.games === 0
                    ? ['rgba(107, 114, 128, 1)']
                    : [
                        'rgba(147, 51, 234, 1)',
                        'rgba(51, 65, 85, 1)',
                    ],
                borderWidth: 1,
            }
        ]
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        }
    };

    return (
        <div className="relative w-[10%] h-[100px] 2xl:w-[20%] 2xl:h-[200px]">
            <Doughnut data={data} options={options}/>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-300 font-medium text-[.6rem] 2xl:text-[1.2rem]">
                    {user.games === 0 ? 'No Games' : 'Winrate'}
                </span>
                <span className="text-white font-bold text-[.8rem] 2xl:text-[1.2rem]">
                    {user.games === 0 ? '--' : `${user.winrate}%`}
                </span>
            </div>
        </div>
    );
}
