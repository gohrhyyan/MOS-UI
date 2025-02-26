import { useState, useCallback } from 'react';

// function to handle file upload via moonraker API, used in uploadFile function
const useFileUpload = ({ currentFiles, showToast, handleFileUploadSuccess }) => {
  // state to track if a file is currently being uploaded
  // used to prevent multiple uploads at the same time
  // and to provide visual feedback to the user
  const [isUploading, setIsUploading] = useState(false);

  // function to generate a unique filename in case a file with the same name already exists
  const getUniqueFilename = (filename) => {
    // Remove .gcode extension for processing
    const baseName = filename.slice(0, -6); // remove .gcode
    
    // Extract existing paths from currentFiles array
    // If currentFiles is not provided, default to empty array
    // extract path value from each file object using .map and anonymous arrow function
    // ? is optional chaining operator, used to avoid errors if currentFiles is null or undefined
    const existingPaths = currentFiles?.map(file => file.path) || [];
    
    // If no file with this name exists, return original
    if (!existingPaths.includes(filename)) {
      return filename;
    }
    
    // Implicit else, Find the next available number
    let counter = 1;
    let newFilename;
    
    // Loop, incrementing (number) suffix until a unique filename is found
    do {
      newFilename = `${baseName}(${counter}).gcode`;
      counter++;
    } while (existingPaths.includes(newFilename));
    
    return newFilename;
  };

  // function to upload a file to the server
  const uploadFile = useCallback(async (file) => {

    // Validate file extension, only allow .gcode files
    if (!file.name.toLowerCase().endsWith('.gcode')) {
      showToast('Only .gcode files are allowed');
      // Return early if file extension is not .gcode
      return;
    }

    // set isUploading state to true to prevent multiple uploads
    setIsUploading(true);

    try {
      // Get unique filename
      const uniqueFilename = getUniqueFilename(file.name);
      
      // Create new file with unique name
      const uniqueFile = new File([file], uniqueFilename, {
        type: file.type,
      });

      // initialize FormData object to send file to server
      // formData is a container for key-value pairs to be sent to the server.
      const formData = new FormData();

      //include the uploaded file in the formData object
      formData.append('file', uniqueFile);
    
      // Send the file to the server
      const response = await fetch('/server/files/upload', {
        method: 'POST',
        body: formData
      });

      // Check if the upload was successful
      if (!response.ok) {
        // If not, throw an error, which will be caught in the catch block
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Parse the response as JSON
      const result = await response.json();
      
      // Create standardized file details object matching PrintFile interface
      const fileDetails = {
        path: result.item.path,
        modified: Math.floor(Date.now() / 1000), // Current Unix timestamp
        size: result.item.size,
        permissions: result.item.permissions || "rw" // Default to "rw" if not provided
      };

      // Call the handleFileUploadSuccess function with the file details
      handleFileUploadSuccess(fileDetails);
      // return early if upload is successful
      return;

    } catch (error) {
      // If an error occurs, show a toast message
      showToast(`Upload failed: ${error.message}`);
      // Return early if an error occurs
      return;
    
     //finally is a block of code that executes regardless of the try/catch result
    } finally {
      setIsUploading(false);
    }
  }, [currentFiles, showToast, handleFileUploadSuccess]);
};

export default useFileUpload;