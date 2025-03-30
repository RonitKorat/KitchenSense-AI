import React from 'react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Analytics Dashboard
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to the Analytics Dashboard for {user?.restaurantName}.
        </p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400">
              Analytics features will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 