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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  const processImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/detect_and_classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      return {
        ...data,
        originalPreview: URL.createObjectURL(imageFile),
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);
      
      const processedResults = await Promise.all(
        images.map(async (image) => {
          try {
            return await processImage(image.file);
          } catch (error) {
            console.error(`Error processing image: ${error.message}`);
            return null;
          }
        })
      );

      // Filter out any failed processing attempts
      const validResults = processedResults.filter(result => result !== null);
      
      setProcessedImages(validResults);
      setShowData(true);
    } catch (error) {
      setProcessingError('Failed to process images. Please try again.');
      console.error('Error in handleProcess:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      // First check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      // Request camera permissions with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      // Check if we have a video element
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Set the video source and store the stream
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraError(null);

      // Add event listener for video loading
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
      setIsCameraActive(false);
      setCameraError(null);
    } catch (err) {
      console.error('Error stopping camera:', err);
      setCameraError('Error stopping camera. Please refresh the page.');
    }
  };

  // Add cleanup on component unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
    const capturedFile = dataURLtoFile(imageData, 'camera-capture.jpg');
    
    // Add the captured image to the images array
    const newImage = {
      file: capturedFile,
      preview: imageData,
      dimensions: {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      }
    };
    
    setImages(prev => [...prev, newImage]);
    
    // Simulate detection results (replace with actual API call later)
    const mockDetectedItems = [
      {
        name: 'Tomato',
        confidence: 95,
        quantity: 12,
        unit: 'pieces',
        status: 'Good'
      },
      {
        name: 'Lettuce',
        confidence: 88,
        quantity: 5,
        unit: 'heads',
        status: 'Medium'
      }
    ];
    
    setDetectedItems(mockDetectedItems);
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Inventory Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track and manage your inventory with real-time AI detection
          </p>
        </motion.div>

        {/* Real-Time Stock Detection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Real-Time Stock Detection
          </h2>
          
          <div className="w-full max-w-2xl mx-auto">
            {/* Camera Feed */}
            <div className="relative">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-[300px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform scale-x-[-1] ${!isCameraActive ? 'hidden' : ''}`}
                />
                {!isCameraActive && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Camera feed will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={startCamera}
                  disabled={isCameraActive}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    isCameraActive 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors duration-200`}
                >
                  Start Camera
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!isCameraActive}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    !isCameraActive 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } transition-colors duration-200`}
                >
                  Stop Camera
                </button>
                <button
                  onClick={captureImage}
                  disabled={!isCameraActive}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    !isCameraActive 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors duration-200`}
                >
                  Capture Image
                </button>
              </div>

              {cameraError && (
                <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
                  {cameraError}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upload Section */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600'
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
              disabled={isProcessing}
              className={`${
                showData 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              } text-white px-8 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-lg font-semibold flex items-center space-x-2 relative overflow-hidden group transition-all duration-300`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : showData ? (
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
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Detection Results */}
        {showData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Detection Results
            </h2>
            
            {processingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{processingError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedImages.map((result, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="relative mb-4">
                    <img
                      src={`data:image/jpeg;base64,${result.annotated_image}`}
                      alt={`Detection result ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detected Items
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(result.item_counts).map(([item, count]) => (
                        <div
                          key={item}
                          className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                        >
                          <span className="text-gray-900 dark:text-white">{item}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {count} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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