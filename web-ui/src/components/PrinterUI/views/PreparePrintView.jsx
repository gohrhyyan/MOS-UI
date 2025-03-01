import { fileUtils } from '../../utils/fileUtils';
import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import QualitySpeedSlider from '../common/QualitySpeedSlider';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import { calculateAdjustedTime } from '../../utils/timeUtils';
// No need to import benchy image since we're using a placeholder
const baseTimeMs = 30 * 60 * 1000;

const PreparePrintView = ({ setSelectedView, printDetails, sendMessage, showToast }) => {
  const [sliderValue, setSliderValue] = useState(2);
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const adjustedTime = calculateAdjustedTime(baseTimeMs, sliderValue);
  const filename = fileUtils.getFilename(printDetails.path);
  const formattedSize = fileUtils.formatFileSize(printDetails.size);

  // Fetch thumbnail when the component mounts
  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        // Show loading state while fetching
        setIsLoading(true);
        
        // Make WebSocket request to get file thumbnails
        const response = await sendMessage("server.files.thumbnails", {
          "filename": printDetails.path
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
            // Based on the response format you shared, we need to construct a URL for the thumbnail
            // The exact format will depend on your server setup
            // This is a common pattern, adjust as needed for your environment
            
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
        console.error('Error fetching thumbnail:', error);
        // Don't show toast error since the fallback image is fine
        setThumbnail(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a valid printDetails
    if (printDetails && printDetails.path) {
      fetchThumbnail();
    }
  }, [printDetails, sendMessage]);

  // Handler for starting the print
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      
      // Send command to start the print
      await sendMessage("printer.print.start", {
        "filename": printDetails.path
      });
      
      // Show success message
      showToast(`Print started: ${filename}`);
      
      // Navigate to the printing view
      setSelectedView('printing');
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
        onBack={() => setSelectedView('home')}
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