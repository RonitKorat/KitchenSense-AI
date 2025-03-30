import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ingredientsData from '../data/ingredients.json';

const Inventory = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showData, setShowData] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      dimensions: null
    }));

    // Get image dimensions
    newImages.forEach(image => {
      const img = new Image();
      img.onload = () => {
        image.dimensions = {
          width: img.width,
          height: img.height
        };
        setImages(prev => [...prev, image]);
      };
      img.src = image.preview;
    });
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleProcess = () => {
    setProcessedImages([...images]); // Store the current images
    setShowData(true);
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
            Inventory Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload and manage your inventory images
          </p>
        </motion.div>

        {/* Enhanced Image Upload Section */}
        {!showData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
                isDragging
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Your Images
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Drag and drop your images here, or click to select files
                  </p>
                  <div className="flex space-x-4">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <span>Choose Files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                      />
                    </label>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Supports: PNG, JPG, GIF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process/Back Button */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <motion.button
              onClick={() => {
                if (showData) {
                  setShowData(false);
                } else {
                  handleProcess();
                }
              }}
              className={`${
                showData 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              } text-white px-8 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-lg font-semibold flex items-center space-x-2 relative overflow-hidden group transition-all duration-300`}
              animate={showData ? {
                scale: [1, 1.1, 1],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              } : {
                scale: [1, 1.1, 1],
                transition: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }
              }}
            >
              {showData ? (
                <>
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back to Upload</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Process Images</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] group-hover:bg-[position:100%_100%] transition-[background-position] duration-500" />
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.5, 1]
                    }}
                  />
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Enhanced Image Grid */}
        {!showData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
              >
                <img
                  src={image.preview}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 brightness-100 contrast-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {image.dimensions && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="text-sm font-medium">
                        {image.dimensions.width} x {image.dimensions.height} pixels
                      </div>
                      <div className="text-xs opacity-75">
                        {Math.round(image.file.size / 1024)} KB
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* JSON Data Display */}
        {showData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Inventory Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(ingredientsData.ingredients).map(([category, items], categoryIndex) => (
                <div
                  key={category}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                >
                  <div className="mb-6">
                    {processedImages[categoryIndex] && (
                      <div className="relative w-3/4 h-32 mx-auto rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-200 group">
                        <img
                          src={processedImages[categoryIndex].preview}
                          alt={`Category ${category} image`}
                          className="w-full h-full object-cover brightness-100 contrast-100 group-hover:brightness-110 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} units
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${(item.freshness / 14) * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.freshness}/14
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {images.length === 0 && !showData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 dark:text-gray-400 mt-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No images</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by uploading your inventory images.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Inventory; 