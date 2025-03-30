import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OptimalStock = () => {
  const [targetDate, setTargetDate] = useState('2025-01-01');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateChange = (e) => {
    setTargetDate(e.target.value);
    setError(null);
  };

  const fetchOptimalStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/predict_optimal_stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch optimal stock prediction');
      }

      if (!data.data) {
        throw new Error('No data received from the server');
      }

      setStockData(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching optimal stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stockData ? {
    labels: Object.keys(stockData),
    datasets: [
      {
        label: 'Optimal Stock Level (g)',
        data: Object.values(stockData),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Optimal Stock Levels by Ingredient' },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Stock Level (g)' }
      },
      x: { title: { display: true, text: 'Ingredients' } }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Optimal Stock Prediction</h2>
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Date (After Jan 1, 2025)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={handleDateChange}
              min="2025-01-01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={fetchOptimalStock}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Optimal Stock Levels'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {stockData && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Optimal Stock Levels for {new Date(targetDate).toLocaleDateString()}
            </h3>
            <Bar options={chartOptions} data={chartData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Stock Details</h4>
              <div className="space-y-2">
                {Object.entries(stockData).map(([ingredient, amount]) => (
                  <div key={ingredient} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{ingredient}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{amount}g</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OptimalStock; 