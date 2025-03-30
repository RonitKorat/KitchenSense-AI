import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CameraIcon, 
  SparklesIcon, 
  ChartPieIcon 
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      name: 'AI-Powered Inventory',
      description: 'Automated inventory tracking using computer vision',
      icon: CameraIcon,
      path: '/inventory'
    },
    {
      name: 'Smart Analytics',
      description: 'Real-time insights and waste reduction metrics',
      icon: ChartBarIcon,
      path: '/analytics'
    },
    {
      name: 'Menu Optimization',
      description: 'AI-driven menu suggestions for better efficiency',
      icon: SparklesIcon,
      path: '/menu'
    },
    {
      name: 'Waste Prediction',
      description: 'Predict and prevent food spoilage',
      icon: ChartPieIcon,
      path: '/waste-management'
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Transform Your Kitchen with
            <span className="text-green-600 dark:text-green-400"> AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Reduce waste, optimize inventory, and increase profitability with our AI-powered smart kitchen system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <Link
              to="/signup"
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-8 py-3 rounded-full border-2 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to optimize your kitchen operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.name}
                to={feature.path}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-12 w-12 text-green-600 dark:text-green-400 mb-4 group-hover:text-green-500 dark:group-hover:text-green-300 transition-colors duration-200" />
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200"
                    whileHover={{ x: 5 }}
                  >
                    {feature.name}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200"
                    whileHover={{ x: 5 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 