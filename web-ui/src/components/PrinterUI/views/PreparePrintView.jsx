import React, { useState, useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import { Clock } from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';
import GCodeViewer from '@sindarius/gcodeviewer';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Helper function to get filename from path
const getFilename = (path) => {
  if (!path) return 'Unknown file';
  return path;
};

// Default base time for calculation in milliseconds (30 minutes)
const baseTimeMs = 30 * 60 * 1000;

const PreparePrintView = ({ setSelectedView, selectedFilePath, sendMessage, showToast, refreshState }) => {
  // State for the component
  //const [sliderValue, setSliderValue] = useState(2); // Default to middle/normal quality
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(baseTimeMs);
  const [formattedSize, setFormattedSize] = useState(null);
  const [viewMode, setViewMode] = useState('thumbnail'); 
  const [gcodeText, setGcodeText] = useState(null);
  const gCodeContainerRef = useRef(null);
  const viewerRef = useRef(null);

// Then in your JSX, change the div to:

  // Computed values
  const filename = getFilename(selectedFilePath);
 // const adjustedTime = calculateAdjustedTime(estimatedTime, sliderValue);

  // Fetch thumbnail and metadata when the component mounts
  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        // Show loading state while fetching
        setIsLoading(true);
        
        if (!filename) {
          console.warn('No file details available');
          setIsLoading(false);
          return;
        }
        
        // Get file metadata to get estimated time
        try {
          const metadata = await sendMessage("server.files.metadata", {
            "filename": filename
          });
          
          console.log('File metadata:', metadata);
          
          // If we have estimated time in the metadata, use it
          if (metadata && metadata.estimated_time) {
            // Convert to milliseconds (API returns seconds)
            setEstimatedTime(metadata.estimated_time * 1000);
          }

          // If we have estimated time in the metadata, use it
          if (metadata && metadata.size) {
            // Convert 
            setFormattedSize(formatFileSize(metadata.size));
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
          // Continue anyway to try getting thumbnails
        }
        
        // Make WebSocket request to get file thumbnails
        const response = await sendMessage("server.files.thumbnails", {
          "filename": filename
        });
        console.log('Thumbnail response:', response);

        const gcode = await fetch(`/server/files/gcodes/${filename}`, {
            method: 'GET',
        });
        
        // Convert the response body from a ReadableStream to text
        const gcodeTextResponse = await gcode.text();
        setGcodeText(gcodeTextResponse)
        // Now process the text content
        
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
    if (filename) {
      fetchFileDetails();
    }
  }, [filename, sendMessage]);






  
  useEffect(() => {
    // Only proceed if we have both the container and the gcode text
    if (gCodeContainerRef.current && gcodeText && viewMode === 'gcode') {
      // Clear previous viewer if it exists
      if (gCodeContainerRef.current.firstChild) {
        gCodeContainerRef.current.innerHTML = '';
      }
      
      const container = gCodeContainerRef.current;
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.className = 'w-full h-full';
      container.appendChild(canvas);
      
      // Initialize the viewer with the canvas
      const viewer = new GCodeViewer(canvas);
      viewerRef.current = viewer;
  
      const initViewer = async () => {
        try {
          setIsLoading(true);
          
          // Wait for initialization
          await viewer.init();
          
          // Register progress callback
          viewer.gcodeProcessor.loadingProgressCallback = (progress) => {
            console.log(`Loading: ${Math.ceil(progress * 100)}%`);
          };
          
          // Configure viewer
          viewer.updateRenderQuality(4);
          viewer.setBackgroundColor('#121212');
          viewer.bed.setBedColor('#B3B3B3');
          viewer.gcodeProcessor.useHighQualityExtrusion(true);
          viewer.gcodeProcessor.updateForceWireMode(false);
          viewer.gcodeProcessor.setAlpha(true);
          // Add these settings to your initViewer function right after await viewer.init()
          viewer.bed.setBedColor('#B3B3B3');
          viewer.setCursorVisiblity(true);
          viewer.setZClipPlane(1000000, -1000000); // Important for visibility
          viewer.axes.show(true);

          // Set build volume based on printer specs
          viewer.bed.buildVolume.x.min = 0;
          viewer.bed.buildVolume.y.min = 0;
          viewer.bed.buildVolume.z.min = 0;
          viewer.bed.buildVolume.x.max = 235; // Adjust based on your printer
          viewer.bed.buildVolume.y.max = 235; // Adjust based on your printer
          viewer.bed.buildVolume.z.max = 250; // Adjust based on your printer

          // These settings affect extrusion rendering
          viewer.gcodeProcessor.useHighQualityExtrusion(true);
          viewer.gcodeProcessor.setVoxelMode(false);
          viewer.gcodeProcessor.voxelWidth = 1;
          viewer.gcodeProcessor.voxelHeight = 1;
          viewer.gcodeProcessor.useSpecularColor(true);

          // Add a tool with appropriate nozzle diameter
          viewer.gcodeProcessor.resetTools();
          viewer.gcodeProcessor.addTool('#FF5722', 0.4); // Color and nozzle diameter

          // Set color mode (0 = Extruder, 1 = Feed Rate, 2 = Feature)
          viewer.gcodeProcessor.setColorMode(2);

          
          // Process file and wait for it to complete
          await viewer.processFile(gcodeText);
          
          viewer.setCursorVisiblity(true);
          viewer.gcodeProcessor.updateFilePosition(viewer.fileSize);
          viewer.simulateToolPosition();
          viewer.forceRender();
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing GCode viewer:', error);
          setIsLoading(false);
        }
      };
      
      initViewer();
      
      // Return cleanup function
      return () => {
        // Nothing to clean up in this specific effect
      };
    }
  }, []);
  
  // Add separate cleanup effect
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        // Proper cleanup when component unmounts
        viewerRef.current = null;
        if (gCodeContainerRef.current) {
          gCodeContainerRef.current.innerHTML = '';
        }
      }
    };
  }, []);







  // Handler for starting the print
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      
      // Send command to start the print
      await sendMessage("printer.print.start", {
        "filename": filename
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
        onBack={() => setSelectedView("home")}
      />
      <div className="flex-1 flex flex-col p-4">
      <div className="w-full aspect-square rounded-lg mb-2 relative">
  {/* Show loading indicator if fetching thumbnail */}
  {isLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 rounded-lg">
      <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"></div>
    </div>
  )}
  
  {/* Conditionally render either thumbnail or GCode viewer based on viewMode */}
  {viewMode === 'thumbnail' ? (
    thumbnail ? (
      <img 
        src={thumbnail}
        alt={`Preview of ${filename}`} 
        className="w-full h-full object-cover rounded-lg"
      />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-lg">
        <svg 
          className="w-16 h-16 mb-2" 
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
        <p className="text-center">No preview available</p>
      </div>
    )
  ) : (
    <div className="w-full h-full rounded-lg overflow-hidden" ref={gCodeContainerRef} />
  )}
</div>
    
    <div className="text-lg mb-1">
        {filename}
        <div className="text-sm">
            {formattedSize}
        </div>
    </div>
      
        <div className="flex items-center justify-center mb-2 gap-2">
          <Clock className="w-5 h-5" />
          <div className="text-2xl font-medium">
            {formatTime(estimatedTime)}
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setViewMode(viewMode === 'thumbnail' ? 'gcode' : 'thumbnail')}
            className="px-4 py-1 rounded-md text-sm font-medium"
          >
            {viewMode === 'thumbnail' ? 'Show GCode View' : 'Show Thumbnail'}
          </button>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={isLoading}
          className={`
            mt-auto w-full rounded-lg py-3 flex items-center justify-center gap-2
          `}
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full"></div>
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