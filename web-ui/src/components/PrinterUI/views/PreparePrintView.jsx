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
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(baseTimeMs);
  const [formattedSize, setFormattedSize] = useState(null);
  const [gcodeText, setGcodeText] = useState(null);
  const gCodeContainerRef = useRef(null);
  const viewerRef = useRef(null);

  // Computed values
  const filename = getFilename(selectedFilePath);

  // Fetch gcode and metadata when the component mounts
  useEffect(() => {
    const fetchFileDetails = async () => {
      try {        
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
          // Continue anyway to try getting gcode
        }
        
        const gcode = await fetch(`/server/files/gcodes/${filename}`, {
            method: 'GET',
        });
        
        // Convert the response body from a ReadableStream to text
        const gcodeTextResponse = await gcode.text();
        setGcodeText(gcodeTextResponse)
        // Now process the text content
        
      } catch (error) {
        console.error('Error fetching file details:', error);
      }
    };
    // Only fetch if we have valid fileUploadDetails
    if (filename) {
      fetchFileDetails();
    }
  }, [filename, sendMessage]);

  /*
  GCode Renderer
  */
  useEffect(() => {
    // Only initialize if we have the container, gcode text, and haven't initialized yet
    if (gCodeContainerRef.current && gcodeText) {
      const container = gCodeContainerRef.current;
      const canvas = document.createElement('canvas');
      canvas.className = 'w-full h-full';
      container.appendChild(canvas);

      // Initialize the viewer in the canvas
      const viewer = new GCodeViewer(canvas);
      viewerRef.current = viewer;
      const initViewer = async () => {
        try {
          // Wait for initialization
          await viewer.init();
          viewer.gcodeProcessor.asyncMode = true;
          // Register progress callback
          /*
          viewer.gcodeProcessor.loadingProgressCallback = (progress) => {
            console.log(`Loading: ${Math.ceil(progress * 100)}%`);
          };
          */
          // Configure viewer
          viewer.updateRenderQuality(4);
          viewer.setBackgroundColor('#0F0F0F');
          viewer.bed.setBedColor('#ffffff');
          viewer.setCursorVisiblity(false);
          viewer.setZClipPlane(1000000, -1000000);
          viewer.bed.isDelta = true;
          viewer.bed.buildVolume.x.min = 0;
          viewer.bed.buildVolume.y.min = 0;
          viewer.bed.buildVolume.z.min = 0;
          viewer.bed.buildVolume.x.max = 150;
          viewer.bed.buildVolume.y.max = 150;
          viewer.bed.buildVolume.z.max = 250;
          viewer.gcodeProcessor.useSpecularColor(false);
          viewer.gcodeProcessor.resetTools();
          viewer.gcodeProcessor.addTool('#FF5722', 0.4);
          viewer.gcodeProcessor.setColorMode(0);
          await viewer.processFile(gcodeText);
          viewer.gcodeProcessor.updateFilePosition(viewer.fileSize);
        } catch (error) {
          console.error('Error initializing GCode viewer:', error);
        } finally {
          setIsLoading(false);
        }
      };
      setTimeout(() => initViewer(), 0);
    } 
  }, [gcodeText]);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        // Proper cleanup when component unmounts
        viewerRef.current = null;
        if (gCodeContainerRef.current) {
          // Nullifies the viewer reference (removes the JavaScript reference)
          // Clears the DOM content (removes the canvas element)
          gCodeContainerRef.current.innerHTML = '';
        }
      }
    };
  }, []);


  /*
  print start logic
  */
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

  /*
  HTML
  */
  return (
  <ResponsiveContainer>
    <TopBar 
      title="Preview" 
      showBack={true} 
      onBack={() => setSelectedView("home")}
    />
    <div className="flex flex-col p-4 h-full">
      <div className="w-full aspect-square rounded-lg mb-2 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 rounded-lg">
            <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"></div>
          </div>
        )}
        <div 
          className="w-full h-full rounded-lg absolute overflow-hidden" 
          ref={gCodeContainerRef} 
        />
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
      <button 
        onClick={handlePrint}
        disabled={isLoading}
        className="mt-auto w-full rounded-lg py-3 flex items-center justify-center gap-2"
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

// Example Configuration for GCodeViewer
/*
// Set rendering quality (1=Low, 2=Medium, 3=High, 4=Ultra, 5=Max)
viewer.updateRenderQuality(4);

// Set the background color of the viewer
viewer.setBackgroundColor('#121212');

// Set the bed/grid color
viewer.bed.setBedColor('#ffffff');

// Show/hide the toolhead cursor
viewer.setCursorVisiblity(true);  // Note the typo in the API - it's "Visiblity" not "Visibility"

// Set Z clipping planes (min and max values for visibility)
viewer.setZClipPlane(1000000, -1000000);

// Show/hide the XYZ axes
viewer.axes.show(false);


Printer Configuration
// Set printer type (true for Delta printers)
viewer.bed.setDelta(true);  // Alternative: viewer.bed.isDelta = true;

// Set build volume dimensions (min values)
viewer.bed.buildVolume.x.min = 0;
viewer.bed.buildVolume.y.min = 0;
viewer.bed.buildVolume.z.min = 0;

// Set build volume dimensions (max values)
viewer.bed.buildVolume.x.max = 150;  // Width
viewer.bed.buildVolume.y.max = 150;  // Depth
viewer.bed.buildVolume.z.max = 250;  // Height

Extrusion & Rendering Quality
// Enable/disable high quality extrusion rendering
viewer.gcodeProcessor.useHighQualityExtrusion(true);

// Force wireframe mode rendering
viewer.gcodeProcessor.updateForceWireMode(false);

// Enable/disable transparency effect
viewer.gcodeProcessor.setAlpha(true);

// Enable/disable voxel rendering mode
viewer.gcodeProcessor.setVoxelMode(false);

// Set voxel dimensions when voxel mode is enabled
viewer.gcodeProcessor.voxelWidth = 1;
viewer.gcodeProcessor.voxelHeight = 1;

// Enable/disable specular lighting (shiny appearance)
viewer.gcodeProcessor.useSpecularColor(true);

// Set CNC Mode - treats G1 commands as extrusion moves
viewer.gcodeProcessor.g1AsExtrusion = false;

Tool & Color Settings
// Reset all tool definitions
viewer.gcodeProcessor.resetTools();

// Add a tool with color and nozzle diameter
viewer.gcodeProcessor.addTool('#FF5722', 0.4);

// Set color mode: 0=Extruder, 1=Feed Rate, 2=Feature Type
viewer.gcodeProcessor.setColorMode(2);

// Update feed rate color mapping (min/max feed rate in mm/min)
viewer.gcodeProcessor.updateColorRate(1200, 6000);  // 20mm/s to 100mm/s

// Set minimum feed rate color
viewer.gcodeProcessor.updateMinFeedColor('#0000FF');  // Blue for slow

// Set maximum feed rate color
viewer.gcodeProcessor.updateMaxFeedColor('#FF0000');  // Red for fast

// Set progress color (for tracking/highlighting current position)
viewer.setProgressColor('#FFFFFF');


Display & Movement Controls
// Show/hide travel moves
viewer.toggleTravels(true);

// Enable/disable object selection highlighting
viewer.buildObjects.showObjectSelection(true);

// Update viewer to match current file position
viewer.gcodeProcessor.updateFilePosition(position);

// Show/hide object boundaries for exclude_object features
viewer.buildObjects.loadObjectBoundaries(objects);

// Set live tracking mode (for following print in real-time)
viewer.gcodeProcessor.setLiveTracking(true);

// Update tool position with current XYZ coordinates
viewer.updateToolPosition([
  { axes: 'X', position: x },
  { axes: 'Y', position: y },
  { axes: 'Z', position: z }
]);

// Simulate tool position (for scrubbing/preview)
viewer.simulateToolPosition();

// Reset camera to default position
viewer.resetCamera();

// Force a render update
viewer.forceRender();

// Handle viewer resize when container changes
viewer.resize();


File Processing
// Process a GCode file (returns a promise)
await viewer.processFile(gcodeText);

// Reload the current file (returns a promise)
await viewer.reload();

// Clear the scene (true to reset everything)
viewer.clearScene(true);

// Cancel an in-progress file load
viewer.gcodeProcessor.cancelLoad = true;

// Check if the last load attempt failed
viewer.lastLoadFailed();

// Clear load failure flag
viewer.clearLoadFlag();


Callback Handlers
// Set callback for load progress updates
viewer.gcodeProcessor.loadingProgressCallback = (progress) => {
  // progress is 0.0 to 1.0
  console.log(`Loading: ${Math.ceil(progress * 100)}%`);
};

// Set callback for object selection/exclusion
viewer.buildObjects.objectCallback = (metadata) => {
  // Called when user selects an object in the viewer
  console.log(`Selected object: ${metadata.name}`);
};
*/