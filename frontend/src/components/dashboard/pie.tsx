'use client'

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

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface WinrateDoughnutChartProps {
    wins?: number;
    losses?: number;
}

export default function DoughnutChart({
    wins = 19,
    losses = 12
}: WinrateDoughnutChartProps) {
    const total = wins + losses;
    const winPercentage = total > 0 ? Math.round((wins / total) * 100) : 0;

    const data: ChartData<'doughnut'> = {
        labels: total === 0 ? ['No Data'] : ['Wins', 'Losses'],
        datasets: [
            {
                data: total === 0 ? [1] : [wins, losses],
                backgroundColor: total === 0
                    ? ['rgba(107, 114, 128, 0.8)']
                    : [
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(51, 65, 85, 0.8)',
                    ],
                borderColor: total === 0
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
        <div className="relative w-[10%]">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-300 font-medium text-[.8rem]">
                    {total === 0 ? 'No Games' : 'Winrate'}
                </span>
                <span className="text-white font-bold text-[.8rem]">
                    {total === 0 ? '--' : `${winPercentage}%`}
                </span>
            </div>
        </div>
    );
}
