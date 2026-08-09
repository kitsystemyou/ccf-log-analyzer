'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HistogramChartProps {
  data: number[];
  title?: string;
  themeVariant?: 'overall' | 'user';
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  title = '出目の出た回数',
  themeVariant = 'overall',
}) => {
  const maxVal = Math.max(...data, 5);

  // クトゥルフ神話モチーフの 1D100 スペクトルカラー (1~10: Gold/Emerald, 11~80: Bioluminescence Cyan/Purple, 81~100: Crimson Fumble)
  const barColors = [
    'rgba(251, 191, 36, 0.85)',   // 1~10 (神聖・極上の成功)
    'rgba(16, 185, 129, 0.85)',  // 11~20 (高確率成功)
    'rgba(0, 245, 212, 0.85)',   // 21~30 (エルドリッチ発光グリーン)
    'rgba(6, 182, 212, 0.85)',   // 31~40 (深海シアン)
    'rgba(59, 130, 246, 0.85)',  // 41~50 (コズミックブルー)
    'rgba(139, 92, 246, 0.85)',  // 51~60 (虚空バイオレット)
    'rgba(168, 85, 247, 0.85)',  // 61~70 (触手パープル)
    'rgba(217, 70, 239, 0.85)',  // 71~80 (狂気マゼンタ)
    'rgba(244, 63, 94, 0.85)',   // 81~90 (危機クリムゾン)
    'rgba(225, 29, 72, 0.95)',   // 91~100 (致命的ファンブル)
  ];

  const borderColors = barColors.map((c) => c.replace(/0\.\d+\)/, '1)'));

  const chartData = {
    labels: ['1~10', '11~20', '21~30', '31~40', '41~50', '51~60', '61~70', '71~80', '81~90', '91~100'],
    datasets: [
      {
        label: '回数',
        data: data,
        backgroundColor: barColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: '#00f5d4',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        color: '#f1f5f9',
        font: {
          size: 17,
          weight: 'bold',
        },
        padding: {
          bottom: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11, 19, 41, 0.95)',
        titleColor: '#fbbf24',
        bodyColor: '#00f5d4',
        borderColor: 'rgba(0, 245, 212, 0.3)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (context) => ` 出現回数: ${context.parsed.y} 回`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          font: {
            size: 13,
          },
        },
        grid: {
          color: 'rgba(0, 245, 212, 0.05)',
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.ceil(maxVal * 1.1),
        ticks: {
          color: '#94a3b8',
          stepSize: Math.max(1, Math.ceil(maxVal / 5)),
          font: {
            size: 13,
          },
          callback: (value) => `${value}回`,
        },
        grid: {
          color: 'rgba(168, 85, 247, 0.08)',
        },
      },
    },
  };

  return (
    <div className="w-full h-72 md:h-80 relative p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
};
