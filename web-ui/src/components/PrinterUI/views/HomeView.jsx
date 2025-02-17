import React, { useRef, useState, useCallback } from 'react';
import { Upload, Settings, History } from 'lucide-react';
import MOSLogo from '../../../assets/MOS.png';
import PrinterImage from '../../../assets/Printer.png';
import ResponsiveContainer from '../common/ResponsiveContainer';

// Define the HomeView component as a functional component
// Functional components are the modern way to write React components using functions
// The ({ setSelectedView }) is using "destructuring" to pull out the setSelectedView prop
// Props are how parent components pass data and functions to child components
const HomeView = ({ setSelectedView, showToast, setPrintDetails, printerState }) => {
  // Handle successful file upload
  const handleFileUploadSuccess = useCallback((fileDetails) => {
    setPrintDetails(fileDetails);
    setSelectedView('prepare');
  }, [setPrintDetails, setSelectedView]);
  
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

    // Handle file upload
    const uploadFile = async (file) => {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.gcode')) {
          showToast('Only .gcode files are allowed');
          return;
      }

      setIsUploading(true);

      try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/server/files/upload', {
              method: 'POST',
              body: formData
          });

          if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          handleFileUploadSuccess({
              filename: result.item.path,
              size: result.item.size
          });

      } catch (error) {
          showToast(`${error.message}`);
      } finally {
          setIsUploading(false);
      }
  };

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

  return(
    <ResponsiveContainer>
      {/* Main container using flexbox for vertical layout */}
      <div 
        className="flex-1 flex flex-col items-center justify-between"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Logo section - centered at the top */}
        <div className="w-full flex justify-center mb-12">
          <img 
            src={MOSLogo}
            alt="MOS Printing Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Printer image section - takes up flexible space in the middle */}
        <div className="w-64 flex-1 flex items-center justify-center mb-12">
          <img 
            src={PrinterImage}
            alt="Printer Preview" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action buttons section at the bottom */}
        <div className="w-full flex items-center justify-center relative">
          
          {/* Main upload button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`
                flex flex-col items-center justify-center gap-2 
                bg-gray-200 rounded-lg px-6 py-3 w-48 
                text-gray-800 hover:bg-gray-300 active:bg-gray-400 
                transition-colors
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isUploading}
        >
            <Upload className={`w-8 h-8 ${isUploading ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-gray-600">
                {isUploading ? 'uploading...' : 'upload design'}
            </span>
        </button>

          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept=".gcode"
          />


          {/* Sidebar buttons */}
          <div className="absolute right-0 flex flex-col gap-4">
            {/* Settings button */}
            <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            {/* History button */}
            <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
              <History className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default HomeView;