import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WasteAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample data for waste classification
  const wasteClassificationData = {
    labels: ['Over-portioning', 'Spoiled Items', 'Preparation Waste', 'Customer Leftovers', 'Other'],
    datasets: [
      {
        label: 'Waste by Category (kg)',
        data: [120, 85, 65, 45, 30],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Sample data for waste heatmap
  const wasteHeatmapData = {
    labels: ['Prep Station', 'Cooking Station', 'Service Station', 'Storage Area', 'Dishwashing'],
    datasets: [
      {
        label: 'Waste Intensity',
        data: [85, 65, 45, 35, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  // Sample data for loss-to-profit analysis
  const lossToProfitData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Loss ($)',
        data: [250, 180, 320, 150, 280, 200, 220],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Daily Profit ($)',
        data: [1200, 1100, 1300, 1000, 1400, 1500, 1300],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Waste Analysis Dashboard',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Vision-Powered Waste Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-driven insights to minimize waste and maximize efficiency
          </p>
        </motion.div>

        {/* Timeframe and Category Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8 shadow-lg">
          <div className="flex flex-wrap gap-4 justify-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="over-portioning">Over-portioning</option>
                <option value="spoiled">Spoiled Items</option>
                <option value="preparation">Preparation Waste</option>
                <option value="leftovers">Customer Leftovers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Food Waste Classification */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Food Waste Classification
            </h2>
            <div className="h-[300px]">
              <Bar data={wasteClassificationData} options={chartOptions} />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Key Insights
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Over-portioning is the leading cause of waste</li>
                <li>• 45% of waste occurs during preparation</li>
                <li>• Customer leftovers account for 15% of total waste</li>
              </ul>
            </div>
          </motion.div>

          {/* Waste Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Waste Heatmap
            </h2>
            <div className="h-[300px]">
              <Bar data={wasteHeatmapData} options={chartOptions} />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                High-Waste Areas
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Prep Station: 85kg waste</li>
                <li>• Cooking Station: 65kg waste</li>
                <li>• Service Station: 45kg waste</li>
              </ul>
            </div>
          </motion.div>

          {/* Loss-to-Profit Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Loss-to-Profit Analysis
            </h2>
            <div className="h-[300px]">
              <Line data={lossToProfitData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Total Loss
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $1,605
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Total Profit
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $8,800
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  Loss-to-Profit Ratio
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  18.2%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recommended Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                Immediate Actions
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Implement portion control training</li>
                <li>• Review prep station procedures</li>
                <li>• Optimize inventory management</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Long-term Improvements
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Install smart portioning scales</li>
                <li>• Implement waste tracking system</li>
                <li>• Develop staff training program</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WasteAnalysis; 