import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Settings, History } from 'lucide-react';
import MOSLogo from '../../../assets/MOS.png';
import PrinterImage from '../../../assets/Printer.png';
import ResponsiveContainer from '../common/ResponsiveContainer';
import useFileUpload from '../../hooks/useFileUpload';

const HomeView = ({ 
  setSelectedView, 
  showToast, 
  setSelectedFilePath, 
  currentFiles, 
  setCurrentFiles, 
  sendMessage, 
  socket 
}) => {

const [isDragging, setIsDragging] = useState(false);
const [showSliceModal, setShowSliceModal] = useState(false);
const [sliceFile, setSliceFile] = useState(null);
const fileInputRef = useRef(null);
const [sliceProgress, setSliceProgress] = useState(0);
const [sliceStatus, setSliceStatus] = useState('');



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
              console.log('File loaded successfully, setting process parameters');
              return eng.setProcess({
                sliceShells: 1,
                sliceFillSparse: 0.25,
                sliceTopLayers: 2,
                sliceBottomLayers: 2
              });
            })
            .then(eng => {
              console.log('Process parameters set, configuring device');
              return eng.setDevice({
                gcodePre: ["M82", "M104 S220"],
                gcodePost: ["M107"]
              });
            })
            .then(eng => {
              console.log('Device configured, starting slice operation');
              return eng.slice();
            })
            .then(eng => {
              console.log('Slice completed, preparing output');
              return eng.prepare();
            })
            .then(eng => {
              console.log('Preparation complete, exporting GCODE');
              return eng.export();
            })
            .then(gcode => {
              console.log('GCODE exported successfully, length:', gcode.length);
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
    const file = e.target.files?.[0];
    //file is already sliced
    if (file && file.name.toLowerCase().endsWith('.gcode')) {
        uploadFile(file);
    }
    //file needs slicing
    else if (file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.obj') || file.name.toLowerCase().endsWith('.3mf')) {
      setSliceFile(file);
      setShowSliceModal(true);
    }
  };


  /*
  Drag and drop handlers
  */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    handleFileInput(e);
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

  /*
  HTML
  */
  return (
    <React.Fragment>
    <ResponsiveContainer>
      <div 
        className="flex flex-col items-center justify-between"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-full flex justify-center mb-4">
          <img 
            src={MOSLogo}
            alt="MOS Printing Logo" 
            className="h-16 w-auto"
          />
        </div>

        <div className="w-64 flex items-center justify-center mb-4">
          <img 
            src={PrinterImage}
            alt="Printer Preview" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="w-full flex items-center justify-center relative">
          <button 
            onClick={() => fileInputRef.current?.click()}
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

          <div className="absolute right-0 flex flex-col gap-4">
            <button className="p-2 rounded-full">
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

    
    {/* Slice Modal */}
    {showSliceModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Slice</h2>
            <p className="text-gray-700 mb-4">{sliceFile?.name}</p>
            
            {/* Simple Progress Bar */}
            {sliceProgress > 0 && (
              <SliceProgressBar 
                progress={sliceProgress} 
                status={sliceStatus}
              />
            )}
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowSliceModal(false)}
                className="px-4 py-2 bg-red-500 rounded-lg text-white"
                disabled={sliceProgress > 0 && sliceProgress < 100}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSlice(sliceFile)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                disabled={sliceProgress > 0 && sliceProgress < 100}
              >
                {sliceProgress > 0 ? 
                  (sliceProgress < 100 ? 'Slicing...' : 'Done') : 
                  'Slice'
                }
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