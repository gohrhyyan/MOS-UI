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

  // Fetch files on component mount
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

  // File input handler
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.gcode')) {
        uploadFile(file);
    }
    else if (file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.obj') || file.name.toLowerCase().endsWith('.3mf')) {
        setSliceFile(file);
        setShowSliceModal(true);
        console.log('Kiri available?', typeof kiri !== 'undefined');
        
          // Use kiri:moto to slice the file
          kiri.newEngine()
                .setListener(msg => console.log('Worker says:', msg))
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
                  uploadFile(gcodeFile);
                })
                .then(console.log)
                .catch(error => {
                  console.error('Error in slicing workflow:', error);
                  showToast('Error: ' + error.message, 'error');
                  setShowSliceModal(false);  
                }); 
          // Close the modal
          setShowSliceModal(false);
    }
  };

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

  // Drag and drop handlers
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
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowSliceModal(false)}
                className="px-4 py-2 rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
              >
                Slice
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