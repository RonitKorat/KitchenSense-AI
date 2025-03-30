import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Menu = () => {
  const { user } = useAuth();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/menu');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate menu');
      }

      setMenuData(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Menu generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Menu Optimization
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered menu optimization for {user?.restaurantName}
          </p>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateMenu}
            disabled={loading}
            className={`px-8 py-4 rounded-lg text-lg font-semibold text-white 
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
              } transition-colors duration-200`}
          >
            {loading ? 'Generating Menu...' : 'Generate Optimized Menu'}
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Menu Display */}
        {menuData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Menu Period */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {menuData.month} {menuData.year}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Special Dishes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Special Dishes
                  </h2>
                  <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
                    Limited Time Offers
                  </span>
                </div>
                <div className="space-y-4">
                  {menuData.menu.special_dishes.map((dish, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {dish.name}
                        </h3>
                        <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
                          {dish.discount} OFF
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {dish.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dish.ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${dish.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Original: ${(dish.price / (1 - parseInt(dish.discount) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Normal Dishes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Regular Menu
                  </h2>
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    Best Sellers
                  </span>
                </div>
                <div className="space-y-4">
                  {menuData.menu.normal_dishes.map((dish, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {dish.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {dish.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dish.ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
        </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu; 