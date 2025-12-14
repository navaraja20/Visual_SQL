import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResultChartsProps {
  data: any[];
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area';

export default function ResultCharts({ data }: ResultChartsProps) {
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [numericColumns, setNumericColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const cols = Object.keys(data[0]);
      setColumns(cols);

      // Detect numeric columns
      const numeric = cols.filter(col => {
        const value = data[0][col];
        return typeof value === 'number' || !isNaN(Number(value));
      });
      setNumericColumns(numeric);

      // Auto-select axes
      if (!xAxis && cols.length > 0) setXAxis(cols[0]);
      if (!yAxis && numeric.length > 0) setYAxis(numeric[0]);
    }
  }, [data]);

  if (!data || data.length === 0) return null;

  const getChartData = () => {
    if (!xAxis || !yAxis) return null;

    const labels = data.map(row => String(row[xAxis])).slice(0, 50); // Limit to 50 points
    const values = data.map(row => Number(row[yAxis]) || 0).slice(0, 50);

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(20, 184, 166, 0.8)',
    ];

    if (chartType === 'pie' || chartType === 'doughnut') {
      return {
        labels: labels.slice(0, 10), // Limit pie charts to 10 slices
        datasets: [{
          data: values.slice(0, 10),
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }],
      };
    }

    return {
      labels,
      datasets: [{
        label: yAxis,
        data: values,
        backgroundColor: chartType === 'area' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: chartType === 'area',
        tension: chartType === 'line' || chartType === 'area' ? 0.4 : 0,
      }],
    };
  };

  const chartData = getChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === 'pie' || chartType === 'doughnut',
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: `${yAxis} by ${xAxis}`,
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
  };

  const downloadChart = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowCharts(!showCharts)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {showCharts ? 'Hide Charts' : 'Visualize Data'}
      </button>

      <AnimatePresence>
        {showCharts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-6"
          >
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as ChartType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  X-Axis (Labels)
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Y-Axis (Values)
                </label>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {numericColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={downloadChart}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>

            {/* Chart Display */}
            {chartData && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6" style={{ height: '400px' }}>
                {chartType === 'bar' && <Bar data={chartData} options={options} />}
                {chartType === 'line' && <Line data={chartData} options={options} />}
                {chartType === 'area' && <Line data={chartData} options={options} />}
                {chartType === 'pie' && <Pie data={chartData} options={options} />}
                {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
              </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Displaying up to {chartType === 'pie' || chartType === 'doughnut' ? '10' : '50'} data points for optimal visualization
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
