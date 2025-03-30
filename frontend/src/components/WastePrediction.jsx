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

const WastePrediction = () => {
  const [targetDate, setTargetDate] = useState('2025-01-01');
  const [wasteData, setWasteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateChange = (e) => {
    setTargetDate(e.target.value);
    setError(null);
  };

  const fetchWastePrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/predict_waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: targetDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch waste prediction');
      }

      const data = await response.json();
      setWasteData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = wasteData ? {
    labels: Object.keys(wasteData.predicted_wastage),
    datasets: [
      {
        label: 'Predicted Waste (g)',
        data: Object.values(wasteData.predicted_wastage),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Predicted Ingredient Waste' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Waste (g)' } },
      x: { title: { display: true, text: 'Ingredients' } }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Waste Prediction</h2>
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
            onClick={fetchWastePrediction}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Waste Prediction'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {wasteData && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Predicted Waste for {new Date(targetDate).toLocaleDateString()}
            </h3>
            <Bar options={chartOptions} data={chartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default WastePrediction;