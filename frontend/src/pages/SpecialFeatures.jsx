import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const SpecialFeatures = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const foodDishes = [
    'Pizza',
    'Burger',
    'Pasta',
    'Salad',
    'Sandwich',
    'Sushi',
    'Tacos',
    'Curry',
    'Soup',
    'Dessert'
  ];

  const filteredDishes = foodDishes.filter(dish =>
    dish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDishSelect = (dish) => {
    setSelectedDish(dish);
    setSearchQuery(dish);
    setIsCameraActive(true);
    startCamera();
  };

  const handleSubmit = () => {
    // Here you can handle the submission of the captured image
    console.log('Submitting image for:', selectedDish);
    
    // Show success message
    setShowSuccess(true);
    
    // Reset everything after 2 seconds
    setTimeout(() => {
      setSelectedDish('');
      setSearchQuery('');
      setIsCameraActive(false);
      setCameraError(null);
      setCapturedImage(null);
      setShowSuccess(false);
      stopCamera();
    }, 2000);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraError(null);

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setCameraError('Error starting video feed. Please try again.');
        });
      };

    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please grant camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera device found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is in use by another application.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setCameraError(errorMessage);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraError(null);
    } catch (err) {
      console.error('Error stopping camera:', err);
      setCameraError('Error stopping camera. Please refresh the page.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    // Flip the context horizontally
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            Image submitted successfully!
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Special Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover our advanced AI-powered kitchen management features
          </p>
        </motion.div>

        {/* Search Box Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 mb-8 relative"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Search Food Dish
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a food dish..."
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown with filtered dishes */}
          {searchQuery && filteredDishes.length > 0 && !selectedDish && (
            <div className="absolute z-50 w-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
              {filteredDishes.map((dish, index) => (
                <button
                  key={index}
                  onClick={() => handleDishSelect(dish)}
                  className="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                >
                  {dish}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Camera Section */}
        {selectedDish && !capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Capture Image for {selectedDish}
            </h2>
            <div className="relative">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-[400px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-white dark:border-gray-300 rounded-lg opacity-50"></div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={captureImage}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Capture Image</span>
                </button>
              </div>

              {cameraError && (
                <p className="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
                  {cameraError}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Captured Image Section */}
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Captured Image for {selectedDish}
            </h2>
            <div className="relative">
              <img
                src={capturedImage}
                alt={`Captured ${selectedDish}`}
                className="w-full max-w-2xl mx-auto rounded-lg"
              />
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setSelectedDish('');
                    setSearchQuery('');
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Remove
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SpecialFeatures; 