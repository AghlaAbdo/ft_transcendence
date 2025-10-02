import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    ChartOptions,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip
);

interface WeeklyGamesChartProps {
    weeklyData?: number[];
}

export default function BarChart({
    weeklyData = [20, 10, 7, 14]
}: WeeklyGamesChartProps) {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
    const currentYear = currentDate.getFullYear();

    const data: ChartData<'bar'> = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                data: weeklyData,
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                ],
                borderColor: [
                    'rgba(147, 51, 234, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(107, 114, 128, 1)',
                ],
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }
        ]
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: `${capitalizedMonth} ${currentYear} - Weekly Games Played`,
                color: '#F9FAFB',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: '#F9FAFB',
                bodyColor: '#E5E7EB',
                borderColor: 'rgba(147, 51, 234, 0.5)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
                ticks: {
                    color: '#9CA3AF'
                }
            },
            y: {
                beginAtZero: true,
                suggestedMax: Math.max(...weeklyData, 5),
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
                ticks: {
                    color: '#9CA3AF',
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="w-full h-full p-4 bg-gray-800 rounded-lg">
            <Bar data={data} options={options} />
        </div>
    );
}
