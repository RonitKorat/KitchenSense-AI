import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import WastePrediction from '../components/WastePrediction';
import OptimalStock from '../components/OptimalStock';
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

// Constants
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years from 2020 to current year - 1 (past years only)
const YEARS = Array.from(
  { length: new Date().getFullYear() - 2020 }, 
  (_, i) => 2020 + i
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYears, setSelectedYears] = useState([2022, 2023]);  // Default to past years
  const [forecastData, setForecastData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Validate date selection
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const selectedDateObj = new Date(newDate);
    const today = new Date();
    
    // If selected date is in the past, show error
    if (selectedDateObj < today) {
      setError('Please select a current or future date for prediction');
      return;
    }
    
    setSelectedDate(newDate);
    setError(null);
  };

  // Check backend status on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health');
        setBackendStatus('connected');
      } catch (err) {
        setBackendStatus('disconnected');
        setError('Backend server is not running. Please start the backend server.');
      }
    };
    checkBackend();
  }, []);

  const generateForecast = async () => {
    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the backend server.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:5000/api/generate_forecast', {
        date: selectedDate
      });
      setForecastData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate forecast. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const compareYears = async () => {
    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the backend server.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (selectedYears.length < 1) {
        setError('Please select at least one year to compare');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/compare_years', {
        date: selectedDate,
        years: selectedYears
      });
      setComparisonData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to compare years. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for forecast
  const forecastChartData = forecastData ? {
    labels: Object.keys(forecastData.predicted_ingredient_consumption),
    datasets: [
      {
        label: 'Predicted Consumption (g)',
        data: Object.values(forecastData.predicted_ingredient_consumption),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      }
    ]
  } : null;

  // Prepare chart data for comparison
  const comparisonChartData = comparisonData ? {
    labels: Object.keys(comparisonData.predicted_ingredient_consumption),
    datasets: [
      ...comparisonData.historical_data.map((data, index) => ({
        label: `Year ${data.year}`,
        data: Object.values(data.ingredient_consumption),
        borderColor: `hsl(${index * 120}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 120}, 70%, 50%, 0.5)`,
        tension: 0.4,
      })),
      {
        label: `Predicted ${new Date(comparisonData.target_date).getFullYear()}`,
        data: Object.values(comparisonData.predicted_ingredient_consumption),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeTab === 'sales' ? 'Ingredient Consumption Forecast' : 'Year Comparison Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Consumption (g)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Ingredients'
        }
      }
    },
  };

  // Show loading state while checking backend
  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Checking backend connection...</p>
        </div>
      </div>
    );
  }

  // Show error state if backend is disconnected
  if (backendStatus === 'disconnected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Backend Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The backend server is not running. Please start the backend server and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                onClick={() => setActiveTab('comparison')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'comparison'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Year Comparison
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
              <button
                onClick={() => setActiveTab('optimal_stock')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'optimal_stock'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Optimal Stock
              </button>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        {(activeTab === 'sales' || activeTab === 'comparison') && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'sales' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date (Current or Future)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            ) : activeTab === 'comparison' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Date (Current or Future)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Past Years to Compare
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {YEARS.map(year => (
                      <label key={year} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(year)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedYears([...selectedYears, year]);
                            } else {
                              setSelectedYears(selectedYears.filter(y => y !== year));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={activeTab === 'sales' ? generateForecast : compareYears}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 
              activeTab === 'sales' ? 'Generate Forecast' : 'Compare Years'}
            </button>
          </div>
        </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
        >
          {activeTab === 'waste' ? (
            <WastePrediction />
          ) : activeTab === 'optimal_stock' ? (
            <OptimalStock />
          ) : (
            <>
              {/* Chart Section */}
              <div className="mb-8">
                {activeTab === 'sales' ? (
                  forecastChartData ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Forecast for {new Date(selectedDate).toLocaleDateString()}
                      </h3>
                      <Bar options={chartOptions} data={forecastChartData} />
                    </>
                  ) : (
                    <div className="text-center text-gray-600 dark:text-gray-300">
                      Generate a forecast to see the chart
                    </div>
                  )
                ) : activeTab === 'comparison' ? (
                  comparisonChartData ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Comparison for {new Date(selectedDate).toLocaleDateString()}
                      </h3>
                      <Bar options={chartOptions} data={comparisonChartData} />
                    </>
                  ) : (
                    <div className="text-center text-gray-600 dark:text-gray-300">
                      Compare years to see the chart
                    </div>
                  )
                ) : null}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    {activeTab === 'sales' ? 'Total Consumption' : 'Year Difference'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'sales' 
                      ? forecastData 
                        ? `${Object.values(forecastData.predicted_ingredient_consumption).reduce((a, b) => a + b, 0)}g`
                        : 'N/A'
                      : comparisonData
                        ? `${Object.values(comparisonData.predicted_ingredient_consumption).reduce((a, b) => a + b, 0) - 
                            Object.values(comparisonData.historical_data[0].ingredient_consumption).reduce((a, b) => a + b, 0)}g`
                        : 'N/A'
                  }
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    {activeTab === 'sales' ? 'Average Consumption' : 'Change Percentage'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'sales'
                      ? forecastData
                        ? `${Math.round(Object.values(forecastData.predicted_ingredient_consumption).reduce((a, b) => a + b, 0) / 
                            Object.keys(forecastData.predicted_ingredient_consumption).length)}g`
                        : 'N/A'
                      : comparisonData
                        ? `${Math.round(((Object.values(comparisonData.predicted_ingredient_consumption).reduce((a, b) => a + b, 0) - 
                            Object.values(comparisonData.historical_data[0].ingredient_consumption).reduce((a, b) => a + b, 0)) / 
                            Object.values(comparisonData.historical_data[0].ingredient_consumption).reduce((a, b) => a + b, 0)) * 100)}%`
                        : 'N/A'
                  }
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    {activeTab === 'sales' ? 'Peak Ingredient' : 'Most Changed Ingredient'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'sales'
                      ? forecastData
                        ? Object.entries(forecastData.predicted_ingredient_consumption)
                            .reduce((a, b) => a[1] > b[1] ? a : b)[0]
                        : 'N/A'
                      : comparisonData
                        ? Object.entries(comparisonData.predicted_ingredient_consumption)
                            .reduce((a, b) => 
                              Math.abs(b[1] - comparisonData.historical_data[0].ingredient_consumption[b[0]]) > 
                              Math.abs(a[1] - comparisonData.historical_data[0].ingredient_consumption[a[0]]) ? b : a
                            )[0]
                        : 'N/A'
                  }
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
                        ? forecastData
                          ? `Based on historical data, we predict ${Object.keys(forecastData.predicted_ingredient_consumption).length} ingredients will be needed for ${MONTHS[new Date(selectedDate).getMonth() - 1]} ${new Date(selectedDate).getFullYear()}.`
                          : 'Generate a forecast to see insights.'
                        : comparisonData
                          ? `Comparing ${MONTHS[new Date(selectedDate).getMonth() - 1]} between ${selectedYears[0]} and ${selectedYears[selectedYears.length - 1]} shows significant changes in ingredient consumption patterns.`
                          : 'Compare years to see insights.'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      {activeTab === 'sales'
                        ? forecastData
                          ? `The forecast suggests optimal inventory levels for ${MONTHS[new Date(selectedDate).getMonth() - 1]} ${new Date(selectedDate).getFullYear()} to minimize waste and maximize efficiency.`
                          : 'Generate a forecast to see insights.'
                        : comparisonData
                          ? `The comparison reveals trends in ingredient usage that can help optimize future inventory management.`
                          : 'Compare years to see insights.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;