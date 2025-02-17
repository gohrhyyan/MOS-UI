import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Settings, History } from 'lucide-react';
import MOSLogo from '../../../assets/MOS.png';
import PrinterImage from '../../../assets/Printer.png';
import ResponsiveContainer from '../common/ResponsiveContainer';
import useFileUpload from '../../hooks/useFileUpload';

const HomeView = ({ 
  setSelectedView, 
  showToast, 
  setPrintDetails, 
  currentFiles, 
  setCurrentFiles, 
  sendMessage, 
  socket, 
  printerState
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      if (socket != null) {
        try {
          const response = await sendMessage("server.files.list", {
            "root": "gcodes"
          });
          setCurrentFiles(response.result);
          console.log('Received files:', currentFiles);
        } catch (error) {
          console.error('Error fetching files:', error);
          showToast('Failed to fetch files');
        }
      }
    };
    fetchFiles();
  }, [socket, sendMessage, setCurrentFiles, showToast]);

  // Handle successful file upload
  const handleFileUploadSuccess = useCallback((fileDetails) => {
    setPrintDetails(fileDetails);
    setSelectedView('prepare');
  }, [setPrintDetails, setSelectedView]);

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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // File input handler
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <ResponsiveContainer>
      <div 
        className="flex-1 flex flex-col items-center justify-between"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-full flex justify-center mb-12">
          <img 
            src={MOSLogo}
            alt="MOS Printing Logo" 
            className="h-16 w-auto"
          />
        </div>

        <div className="w-64 flex-1 flex items-center justify-center mb-12">
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
              flex flex-col items-center justify-center gap-2 
              bg-gray-200 rounded-lg px-6 py-3 w-48 
              text-gray-800 hover:bg-gray-300 active:bg-gray-400 
              transition-colors
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              ${isDragging ? 'bg-gray-300' : ''}
            `}
            disabled={isUploading}
          >
            <Upload className={`w-8 h-8 ${isUploading ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-gray-600">
              {isUploading ? 'uploading...' : 'upload design'}
            </span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept=".gcode"
          />

          <div className="absolute right-0 flex flex-col gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button 
              onClick={() => setSelectedView('history')}
              className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
            >
              <History className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default HomeView;