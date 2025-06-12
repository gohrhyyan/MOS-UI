import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Settings, History, Video } from 'lucide-react';
import MOSLogo from '../../../assets/MOS.png';
import PrinterImage from '../../../assets/Printer.png';
import ResponsiveContainer from '../common/ResponsiveContainer';
import useFileUpload from '../../hooks/useFileUpload';

const HomeView = ({ 
  printerState,
  klippyState,
  setSelectedView, 
  showToast, 
  setSelectedFilePath, 
  currentFiles, 
  setCurrentFiles, 
  sendMessage, 
  socket 
}) => {

const [showSliceModal, setShowSliceModal] = useState(false);
const [sliceFile, setSliceFile] = useState(null);
const fileInputRef = useRef(null);
const [sliceProgress, setSliceProgress] = useState(0);
const [sliceStatus, setSliceStatus] = useState('');
const [speedMode, setSpeedMode] = useState('normal');
const [rotation, setRotation] = useState({ x: 0, y: 0 });

/*
File Handlers
*/
//Fetch files on component mount
useEffect(() => {
  if (!socket) return;
  const fetchFiles = async () => {
      try {
        const response = await sendMessage("server.files.list", {
          "root": "gcodes"
        });
        setCurrentFiles(response);
        console.log('Set Files:', currentFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
    }
  };
  fetchFiles();
}, [socket]);

// Handle successful file upload
const handleFileUploadSuccess = useCallback((uploadedFilePath) => {
  setSelectedFilePath(uploadedFilePath);
  setSelectedView('prepare');
}, [setSelectedFilePath, setSelectedView]);

// Initialize file upload handler
const { uploadFile, isUploading } = useFileUpload({
  currentFiles,
  showToast,
  handleFileUploadSuccess
});

const speedMultiplier = speedMode === 'normal' ? 1 : speedMode === 'fast' ? 4 : 12;
const layerMultiplier = speedMode === 'normal' ? 2 : speedMode === 'fast' ? 4 : 5;

// sample configs
// https://github.com/GridSpace/grid-apps/tree/master/src/cli
// https://github.com/GridSpace/grid-apps/blob/master/src/cli/kiri-fdm-process.json
// https://github.com/GridSpace/grid-apps/blob/master/src/cli/kiri-fdm-device.json
const handleSlice = (file) => {
  console.log('Kiri available?', typeof kiri !== 'undefined');
    // Use kiri:moto to slice the file
    kiri.newEngine()
          .setListener(msg => { console.log(msg) 
              // Get the first property from the message that has an update value
    const operation = Object.keys(msg)[0];
    if (operation && msg[operation] && msg[operation].update !== undefined) {
      // Update progress directly from the value
      setSliceProgress(msg[operation].update * 100);
      
      // Update status if available
      if (msg[operation].updateStatus) {
        setSliceStatus(msg[operation].updateStatus);
      } else {
        // Use the operation name as status
        setSliceStatus(operation.charAt(0).toUpperCase() + operation.slice(1));
      }
    }
          })
          //replace with loading
          .load(URL.createObjectURL(file))
          .then(eng => {
            eng.rotate(
              (rotation.x * Math.PI) / 180, // X-axis rotation
              (rotation.y * Math.PI) / 180, // Y-axis rotation
              0 // Z-axis rotation (not used)
            );
            console.log('File loaded successfully, setting process parameters')
            return eng.setProcess({
              sliceHeight: 0.1 * layerMultiplier,         // layer height in mm
              firstSliceHeight: 0.1 * layerMultiplier,
              sliceShells: 2,            // Number of outer walls
              sliceTopLayers: 2,         // Solid top layers
              sliceBottomLayers: 2,      // Solid bottom layers
              sliceFillSparse: 0.25,     // Infill density 0 to 1

              sliceSupportEnable: true, // Enable support structures (false = no supports)
              sliceSupportDensity: 0.25,  // how much supports to use 0 to 1

              outputFeedrate: 50 * speedMultiplier,     // Default printing speed (mm/s)
              firstLayerRate: 10 * speedMultiplier,     // Print speed for first layer (mm/s)// Print speed for first layer (mm/s)
              outputFinishrate: 50 * speedMultiplier,   // Finishing pass speed (mm/s)
              sliceFillRate: 0 * speedMultiplier,       // Infill printing speed (mm/s, 0 = use default)
              firstLayerFillRate: 35 * speedMultiplier, // Infill speed for first layer (mm/s)
              outputSeekrate: 80 * speedMultiplier,     // Non-printing movement speed (mm/s)
              outputRetractSpeed: 30, // Retraction speed (mm/s)
              outputRetractDwell: 30, // Dwell time after retraction (ms)   
              outputMinSpeed: 10 * speedMultiplier,     // Minimum printing speed (mm/s)
            });
          })
          .then(eng => {return eng.setMode("FDM");})
          .then(eng => {
            return eng.setDevice({
              deviceType: "FDM",      // FDM for delta printers
              originCenter: true,     // Place origin at bed center (critical for delta printers)
              bedWidth: 150,          // Circular bed diameter (mm)
              bedDepth: 150,          // Same as bedWidth for circular bed
              resolutionX: 0.1,       // X-axis resolution (mm, typical for Marlin)
              resolutionY: 0.1,       // Y-axis resolution (mm, typical for Marlin)
              deviceZMax: 120,        // Maximum Z height (mm, same as maxHeight)
              gcodeTime: true,        // Include time estimation in G-code
              maxHeight: 120,         // Maximum build height (mm)
              round: true,            // Indicate circular bed (delta-specific)
              gcodeLayer: false,      // Disable layer comments in G-code (optional, set to true for debugging)
              gcodePre: [
                "G28",                // Home all axes (delta-specific)
                "G90",                // Absolute positioning
                "M82"                // Absolute E steps (extruder)
              ],
              gcodePost: [
                "G28",                // Home all axes (delta-specific)
                "M104 S0",            // Turn off extruder
                "M84"                 // Disable motors
              ],
              nozzle: [1],          // Nozzle diameter (mm)
              filament: 1.75,         // Filament diameter (mm)
              gcodeFlavor: "Marlin",   // Firmware flavor (Marlin for most delta printers)
              extruders: [{
              "extFilament": 1.75,
              "extNozzle": 1,
              "extOffsetX": 0,
              "extOffsetY": 0
          }]
            });
          })
          .then(eng => {return eng.slice();})
          .then(eng => {return eng.prepare();})
          .then(eng => {return eng.export();})
          .then(gcode => {
            // Convert the gcode to a file object
            const gcodeFile = new File(
              [gcode],
              `${file.name.split('.')[0]}.gcode`,
              { type: 'text/plain' }
            );
            // Upload the sliced gcode file
            setShowSliceModal(false);
            uploadFile(gcodeFile);
          })
          .catch(error => {
            console.error('Error in slicing workflow:', error);
            showToast('Error: ' + error.message, 'error'); 
          }); 
}

// File input handler
const handleFileInput = (e) => {
  console.log("handling file input")
  const file = e.target.files?.[0];
  //file is already sliced
  if (file && file.name.toLowerCase().endsWith('.gcode')) {
      uploadFile(file);
  }
  //file needs slicing
  else if (file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.obj') || file.name.toLowerCase().endsWith('.3mf')) {
    console.log("needs slicing")
    setRotation({ x: 0, y: 0 });
    setSliceFile(file);
    setShowSliceModal(true);
  }
};


// Simple SliceProgressBar component
const SliceProgressBar = ({ progress, status }) => (
<div className="mt-6">
  <div className="flex justify-between mb-1">
    <span className="text-sm">{status}</span>
    <span className="text-sm font-medium">{Math.round(progress)}%</span>
  </div>
  <div style={{ backgroundColor: 'var(--button-background)' }} className="w-full rounded-full h-2">
    <div 
      className="bg-blue-500 rounded-full h-2 transition-all duration-300 ease-linear"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
)

const SpeedToggle = ({ speedMode, setSpeedMode, sliceProgress }) => (
  <div className="flex justify-center mb-4">
    <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: 'var(--button-background)' }}>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium ${speedMode === 'normal' ? 'bg-blue-500 text-white' : 'text-[var(--text-color)]'}`}
        onClick={() => setSpeedMode('normal')}
        disabled={sliceProgress > 0 && sliceProgress < 100}
        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
      >
        Normal
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium ${speedMode === 'fast' ? 'bg-blue-500 text-white' : 'text-[var(--text-color)]'}`}
        onClick={() => setSpeedMode('fast')}
        disabled={sliceProgress > 0 && sliceProgress < 100}
        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
      >
        Fast
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium ${speedMode === 'insane' ? 'bg-blue-500 text-white' : 'text-[var(--text-color)]'}`}
        onClick={() => setSpeedMode('insane')}
        disabled={sliceProgress > 0 && sliceProgress < 100}
        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
      >
        Insane
      </button>
    </div>
  </div>
);

  const RotateControl = ({ setRotation, sliceProgress }) => (
    <div className="mb-4">
                <h3 className="text-lg font-small mb-2">Rotate Model</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* X-Axis Rotation */}
                  <div className="flex flex-col items-center">
                    <label className="text-sm mb-1">X</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRotation({ ...rotation, x: (rotation.x - 90) % 360 })}
                        className="px-3 py-1 rounded-lg bg-[var(--button-background) text-[var(--text-color)]"
                        disabled={sliceProgress > 0 && sliceProgress < 100}
                        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{rotation.x}°</span>
                      <button
                        onClick={() => setRotation({ ...rotation, x: (rotation.x + 90) % 360 })}
                        className="px-3 py-1 rounded-lg bg-[var(--button-background) text-[var(--text-color)]"
                        disabled={sliceProgress > 0 && sliceProgress < 100}
                        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Y-Axis Rotation */}
                  <div className="flex flex-col items-center">
                    <label className="text-sm mb-1">Y </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRotation({ ...rotation, y: (rotation.y - 90) % 360 })}
                        className="px-3 py-1 rounded-lg bg-[var(--button-background) text-[var(--text-color)]"
                        disabled={sliceProgress > 0 && sliceProgress < 100}
                        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{rotation.y}°</span>
                      <button
                        onClick={() => setRotation({ ...rotation, y: (rotation.y + 90) % 360 })}
                        className="px-3 py-1 rounded-lg bg-[var(--button-background) text-[var(--text-color)]"
                        disabled={sliceProgress > 0 && sliceProgress < 100}
                        style={{ opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  )

  /*
  HTML
  */
  return (
    <React.Fragment>
      {!socket? (
        <ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-opacity-75 rounded-lg">
                                <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-[var(--text-color)] rounded-full"></div>
                                <div className="mt-4">Connecting</div>
                            </div>
          </ResponsiveContainer>
      ) : (
      <ResponsiveContainer>
        <div className="flex flex-col items-center h-full min-h-0">
          <div className="w-full flex justify-center">
            <img 
              src={MOSLogo}
              alt="MOS Printing Logo" 
              className="h-16 w-auto invert-in-dark"
            />
          </div>

          <div className="w-64 flex items-center justify-center mb-4">
            <img 
              src={PrinterImage}
              alt="Printer Preview" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-64 flex items-center justify-center mb-4">
            <span className={`text-sm font-medium ${klippyState === "ready" ? 'text-green-500' : 'text-red-500'}`}>
              {klippyState[0]?.toUpperCase() + klippyState?.slice(1)}
            </span>
          </div>

        <div className="w-full flex items-center justify-center relative">
          <button 
            onClick={() => {fileInputRef.current?.click()}}
            className={`
              flex flex-col items-center justify-center gap-2 rounded-lg px-6 py-3 w-48
            `}
            disabled={isUploading}
          >
            <Upload className={`w-8 h-8 ${isUploading ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isUploading ? 'uploading...' : 'upload design'}
            </span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
          />

          
        <div className="absolute right-0 flex flex-col gap-4 bottom-0">
          <button onClick={() => setSelectedView('camera')}
                    className="p-2 rounded-full" 
            >
              <Video className="w-6 h-6" />
            </button>
            <button onClick={() => setSelectedView('settings')}
                    className="p-2 rounded-full" 
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setSelectedView('history')}
              className="p-2 rounded-full"
            >
              <History className="w-6 h-6" />
            </button>
          </div>
        </div>
    </div>
      </ResponsiveContainer>
      )}
      
      {/* Slice Modal */}
      {showSliceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{sliceFile?.name}</h2>
              
              {/* Speed Toggle */}
              <SpeedToggle speedMode={speedMode} setSpeedMode={setSpeedMode} sliceProgress={sliceProgress} />
              
              {/*Rotate Controls*/}
              <RotateControl setRotation={setRotation} sliceProgress={sliceProgress} />

              {/* Insane Mode Warning */}
              {speedMode === 'insane' && (
                <div className="mb-4 text-sm">
                  Are you sure you want to push the limits? This will cause accelerated wear of the motors, drivers and frame.
                </div>
              )}

              {speedMode === 'fast' && (
                <div className="mb-4 text-sm">
                  Increasing speed may affect print quality.
                </div>
              )}
              
              {/* Simple Progress Bar */}
              {sliceProgress > 0 && (
                <SliceProgressBar 
                  progress={sliceProgress} 
                  status={sliceStatus}
                />
              )}
              
              <div className={`flex ${speedMode === 'insane' ? 'flex-col items-end gap-2 w-full' : 'justify-end gap-4'} mt-6`}>
                <button
                  onClick={() => {setShowSliceModal(false);
                    setSliceFile(null);
                    fileInputRef.current.value = null;}}
                  className={`${speedMode === 'insane' ? 'bg-blue-500 text-white w-full': 'sm:w-auto'} px-4 py-2 rounded-lg`}
                  disabled={sliceProgress > 0 && sliceProgress < 100}
                  style={{ 
                    opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 
                  }}
                >
                  {speedMode === 'insane' ? 'No, I want my Mommy.' : 'Cancel'}
                </button>

                <button
                  onClick={() => handleSlice(sliceFile)}
                  className={`${speedMode === 'insane' ? 'bg-red-500 w-full' : 'bg-blue-500 sm:w-auto'} text-white px-4 py-2 rounded-lg`}
                  style={{ 
                    opacity: sliceProgress > 0 && sliceProgress < 100 ? 0.5 : 1 
                  }}
                  disabled={sliceProgress > 0 && sliceProgress < 100}
                >
                  {speedMode === 'insane' ? 'Yes, bring it on!' : 'Slice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default HomeView;
