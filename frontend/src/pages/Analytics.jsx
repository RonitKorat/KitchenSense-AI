import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('sales');

  // Sample data for Sales Forecasting
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Actual Sales',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
      },
      {
        label: 'Predicted Sales',
        data: [70, 65, 85, 85, 60, 60],
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  // Sample data for Waste Prediction
  const wasteData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Actual Waste',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4,
      },
      {
        label: 'Predicted Waste',
        data: [15, 20, 18, 28, 25, 32, 30],
        borderColor: 'rgb(75, 192, 192)',
        borderDash: [5, 5],
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
        text: activeTab === 'sales' ? 'Sales Forecasting' : 'Waste Prediction',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Make data-driven decisions with AI-powered insights
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'sales'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Sales Forecasting
              </button>
              <button
                onClick={() => setActiveTab('waste')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'waste'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Waste Prediction
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
        >
          {/* Chart Section */}
          <div className="mb-8">
            <Line options={chartOptions} data={activeTab === 'sales' ? salesData : wasteData} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {activeTab === 'sales' ? 'Total Sales' : 'Total Waste'}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'sales' ? '$24,500' : '1,250 kg'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                {activeTab === 'sales' ? 'Growth Rate' : 'Reduction Rate'}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'sales' ? '+15%' : '-8%'}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Prediction Accuracy
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                92%
              </p>
            </div>
          </div>

          {/* Insights Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {activeTab === 'sales'
                    ? 'Sales are expected to increase by 20% next month based on current trends and seasonal patterns.'
                    : 'Waste reduction initiatives have shown positive results, with a 15% decrease in food waste.'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {activeTab === 'sales'
                    ? 'Peak sales hours are between 12 PM and 3 PM, suggesting optimal staffing times.'
                    : 'Most waste occurs during weekend operations, indicating a need for better weekend inventory management.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics; 