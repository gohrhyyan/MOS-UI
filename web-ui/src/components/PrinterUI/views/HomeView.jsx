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
            accept=".gcode"
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
  );
};

export default HomeView;