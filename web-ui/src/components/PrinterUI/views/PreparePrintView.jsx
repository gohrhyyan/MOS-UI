import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import QualitySpeedSlider from '../common/QualitySpeedSlider';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Helper function to get filename from path
const getFilename = (path) => {
  if (!path) return 'Unknown file';
  return path.split('/').pop();
};

// Helper function to calculate adjusted time based on quality setting
const calculateAdjustedTime = (baseTimeMs, sliderValue) => {
  // Default slider has 3 steps (0-4), with 2 being normal speed
  const speedFactor = sliderValue < 2 ? 1 + (2 - sliderValue) * 0.25 : 1 / (1 + (sliderValue - 2) * 0.25);
  return baseTimeMs * speedFactor;
};

// Default base time for calculation in milliseconds (30 minutes)
const baseTimeMs = 30 * 60 * 1000;

const PreparePrintView = ({ fileUploadDetails, sendMessage, showToast, refreshState }) => {
  // State for the component
  const [sliderValue, setSliderValue] = useState(2); // Default to middle/normal quality
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(baseTimeMs);
  
  // Computed values
  const filename = getFilename(fileUploadDetails?.filename);
  const formattedSize = formatFileSize(fileUploadDetails?.size || 0);
  const adjustedTime = calculateAdjustedTime(estimatedTime, sliderValue);

  // Fetch thumbnail and metadata when the component mounts
  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        // Show loading state while fetching
        setIsLoading(true);
        
        if (!fileUploadDetails?.filename) {
          console.warn('No file details available');
          setIsLoading(false);
          return;
        }
        
        // Get file metadata to get estimated time
        try {
          const metadata = await sendMessage("server.files.metadata", {
            "filename": fileUploadDetails.filename
          });
          
          console.log('File metadata:', metadata);
          
          // If we have estimated time in the metadata, use it
          if (metadata && metadata.estimated_time) {
            // Convert to milliseconds (API returns seconds)
            setEstimatedTime(metadata.estimated_time * 1000);
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
          // Continue anyway to try getting thumbnails
        }
        
        // Make WebSocket request to get file thumbnails
        const response = await sendMessage("server.files.thumbnails", {
          "filename": fileUploadDetails.filename
        });
        
        console.log('Thumbnail response:', response);
        
        // Check if we have thumbnails in the response
        if (response && Array.isArray(response) && response.length > 0) {
          // Sort thumbnails by size (width × height) in descending order to get highest resolution first
          const sortedThumbnails = [...response].sort((a, b) => {
            const aSize = (a.width || 0) * (a.height || 0);
            const bSize = (b.width || 0) * (b.height || 0);
            return bSize - aSize; // Descending order
          });
          
          // Choose the highest resolution thumbnail (first one after sorting)
          const selectedThumbnail = sortedThumbnails[0];
          
          if (selectedThumbnail && selectedThumbnail.thumbnail_path) {
            // Construct the URL for the thumbnail
            const thumbnailUrl = `/server/files/gcodes/${selectedThumbnail.thumbnail_path}`;
            
            // Set the thumbnail URL
            setThumbnail(thumbnailUrl);
            console.log('Using thumbnail path:', thumbnailUrl);
          } else {
            console.log('No valid thumbnail path found');
            setThumbnail(null);
          }
        } else {
          // No thumbnails found, set to null to use placeholder
          console.log('No thumbnails found in response');
          setThumbnail(null);
        }
      } catch (error) {
        console.error('Error fetching file details:', error);
        setThumbnail(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have valid fileUploadDetails
    if (fileUploadDetails) {
      fetchFileDetails();
    }
  }, [fileUploadDetails, sendMessage]);

  // Handler for starting the print
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      
      // Send command to start the print
      await sendMessage("printer.print.start", {
        "filename": fileUploadDetails.filename
      });
      
      // Show success message
      showToast(`Print started: ${filename}`);
      
      // Refresh printer state to update UI
      refreshState();
      
    } catch (error) {
      console.error('Error starting print:', error);
      showToast(`Failed to start print: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveContainer>
      <TopBar 
        title="Preview" 
        showBack={true} 
        // Note: We don't have setSelectedView passed as a prop, so we use refreshState instead
        // This will take us back to the home view if we're not printing
        onBack={() => refreshState()}
      />
      <div className="flex-1 flex flex-col p-4">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 relative">
          {/* Show loading indicator if fetching thumbnail */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Show thumbnail if available, otherwise show "No preview available" placeholder */}
          {thumbnail ? (
            <img 
              src={thumbnail}
              alt={`Preview of ${filename}`} 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-lg bg-gray-200">
              <svg 
                className="w-16 h-16 mb-2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <p className="text-gray-500 text-center">No preview available</p>
            </div>
          )}
        </div>
        
        <div className="text-lg mb-1 text-gray-800">
            {filename}
            <div className="text-sm text-gray-500">
                {formattedSize}
            </div>
        </div>
        
        <QualitySpeedSlider 
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          adjustedTime={adjustedTime}
        />
        
        <button 
          onClick={handlePrint}
          disabled={isLoading}
          className={`
            mt-auto w-full rounded-lg py-3 flex items-center justify-center gap-2 
            ${isLoading ? 'bg-gray-300 text-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400'}
            transition-colors
          `}
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              Preparing...
            </>
          ) : (
            <>
              <Printer className="w-5 h-5" />
              Print
            </>
          )}
        </button>
      </div>
    </ResponsiveContainer>
  );
};

export default PreparePrintView;