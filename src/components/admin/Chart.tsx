import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({ type, data, options = {}, className = '' }) => {
  const defaultOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index' as const,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          beginAtZero: true,
        },
      },
    } : {},
    ...options,
  }), [type, options]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={defaultOptions} />;
      case 'bar':
        return <Bar data={data} options={defaultOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {renderChart()}
    </div>
  );
};

export default Chart;

// Chart data generators for common use cases
export const generateLineChartData = (labels: string[], datasets: Array<{
  label: string;
  data: number[];
  color: string;
}>) => ({
  labels,
  datasets: datasets.map(dataset => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.color,
    backgroundColor: dataset.color + '20',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: dataset.color,
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
  })),
});

export const generateBarChartData = (labels: string[], datasets: Array<{
  label: string;
  data: number[];
  color: string;
}>) => ({
  labels,
  datasets: datasets.map(dataset => ({
    label: dataset.label,
    data: dataset.data,
    backgroundColor: dataset.color,
    borderColor: dataset.color,
    borderWidth: 1,
    borderRadius: 6,
    borderSkipped: false,
  })),
});

export const generateDoughnutChartData = (labels: string[], data: number[], colors: string[]) => ({
  labels,
  datasets: [{
    data,
    backgroundColor: colors,
    borderWidth: 0,
    hoverBorderWidth: 2,
    hoverBorderColor: '#fff',
  }],
});

// Chart theme colors
export const chartColors = {
  primary: '#8B5CF6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  gray: '#6B7280',
  gradients: {
    purple: ['#8B5CF6', '#A78BFA'],
    green: ['#10B981', '#34D399'],
    blue: ['#3B82F6', '#60A5FA'],
    orange: ['#F59E0B', '#FBBF24'],
    red: ['#EF4444', '#F87171'],
  },
};