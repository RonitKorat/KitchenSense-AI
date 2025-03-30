import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CameraIcon, 
  SparklesIcon, 
  ChartPieIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const metrics = [
    {
      name: 'Daily Waste',
      value: '5.2 kg',
      change: '-12%',
      icon: ChartBarIcon,
      path: '/waste-management',
      description: 'Track and optimize food waste'
    },
    {
      name: 'Inventory Items',
      value: '156',
      change: '+8%',
      icon: CameraIcon,
      path: '/inventory',
      description: 'Manage your inventory with AI'
    },
    {
      name: 'Menu Optimization',
      value: '92%',
      change: '+5%',
      icon: SparklesIcon,
      path: '/menu',
      description: 'Optimize your menu for efficiency'
    },
    {
      name: 'Cost Savings',
      value: '$1,250',
      change: '+15%',
      icon: ChartPieIcon,
      path: '/analytics',
      description: 'View detailed analytics and insights'
    },
  ];

  const alerts = [
    {
      title: 'Low Stock Alert',
      message: 'Tomatoes running low. Consider ordering more.',
      time: '2 hours ago',
      type: 'warning',
    },
    {
      title: 'Waste Reduction',
      message: "You've reduced waste by 15% this week!",
      time: '1 day ago',
      type: 'success',
    },
  ];

  return (
    <div className="min-h-screen pt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100">
              <BellIcon className="h-6 w-6" />
            </button>
            <button className="p-2 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100">
              <UserCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-100 dark:border-blue-900 hover:shadow-xl transition-all duration-200"
            >
              <Link to={metric.path} className="block">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <metric.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{metric.name}</p>
                    <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">{metric.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${
                    metric.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">vs last week</span>
                </div>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{metric.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-100 dark:border-blue-900"
        >
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-4 rounded-lg ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50/80 dark:bg-yellow-900/20' 
                    : 'bg-green-50/80 dark:bg-green-900/20'
                } backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">{alert.title}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{alert.message}</p>
                  </div>
                  <span className="text-xs text-blue-500 dark:text-blue-300">{alert.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 