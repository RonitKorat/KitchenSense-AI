import { motion } from 'framer-motion';

const WasteManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Waste Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            This feature is coming soon! Track and optimize your food waste with AI-powered insights.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WasteManagement; 