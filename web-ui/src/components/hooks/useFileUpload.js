import { useState, useCallback } from 'react';

const useFileUpload = ({ currentFiles, showToast, handleFileUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const getUniqueFilename = (filename) => {
    // Remove .gcode extension for processing
    const baseName = filename.slice(0, -6); // remove .gcode
    
    // Extract existing paths from currentFiles array
    const existingPaths = currentFiles?.map(file => file.path) || [];
    
    // If no file with this name exists, return original
    if (!existingPaths.includes(filename)) {
      return filename;
    }
    
    // Find the next available number
    let counter = 1;
    let newFilename;
    do {
      newFilename = `${baseName}(${counter}).gcode`;
      counter++;
    } while (existingPaths.includes(newFilename));
    
    return newFilename;
  };

  const uploadFile = useCallback(async (file) => {
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.gcode')) {
      showToast('Only .gcode files are allowed');
      return;
    }

    setIsUploading(true);

    try {
      // Get unique filename
      const uniqueFilename = getUniqueFilename(file.name);
      
      // Create new file with unique name
      const uniqueFile = new File([file], uniqueFilename, {
        type: file.type,
      });

      const formData = new FormData();
      formData.append('file', uniqueFile);
      
      const response = await fetch('/server/files/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create standardized file details object matching PrintFile interface
      const fileDetails = {
        path: result.item.path,
        modified: Math.floor(Date.now() / 1000), // Current Unix timestamp
        size: result.item.size,
        permissions: result.item.permissions || "rw" // Default to "rw" if not provided
      };

      handleFileUploadSuccess(fileDetails);
      return fileDetails;

    } catch (error) {
      showToast(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [currentFiles, showToast, handleFileUploadSuccess]);

  return {
    uploadFile,
    isUploading
  };
};

export default useFileUpload;