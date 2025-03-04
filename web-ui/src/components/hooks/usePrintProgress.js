// src/hooks/usePrintProgress.js
import { useState, useEffect, useCallback, useRef } from 'react';


// This hook centralizes all printer state management
export const usePrintProgress = (socket, sendMessage) => {
  // Core printer state
  const [printerState, setPrinterState] = useState({
    printStatus: 'idle',     // Current status: 'idle', 'printing', 'paused', etc.
    filename: null,          // Current file being printed
    progress: 0,             // Print progress (0-100)
    elapsedTime: 0,          // Time elapsed in seconds since print started
    estimatedTime: 0,        // Estimated total time in seconds
    isLoading: true,         // Loading state while initializing
    fileDetails: null,       // Detailed file metadata
  });


  // Ref to store the interval for cleanup
  const progressInterval = useRef(null);


  // Function to update printer state - single source of truth
  // Takes in a partial state object and merges it with the current state
  const updatePrinterState = useCallback((newState) => {
    setPrinterState(currentState => ({
      ...currentState,
      ...newState
    }));
  }, []);


  // Process WebSocket messages from the printer
  const processWebSocketUpdate = useCallback((message) => {
    // Check message type and update state accordingly
    if (message.method === "notify_status_update") {
      // Handle status updates (progress, temperatures, etc.)
      const statusData = message.params[0];
      if (statusData.print_stats) {
        updatePrinterState({
          printStatus: statusData.print_stats.state,
          filename: statusData.print_stats.filename,
          elapsedTime: statusData.print_stats.print_duration
        });
      }
      
      // Calculate progress based on elapsed time vs estimated time
      if (printerState.estimatedTime > 0 && printerState.elapsedTime > 0) {
        const calculatedProgress = Math.min(
          (printerState.elapsedTime / printerState.estimatedTime) * 100, 
          100
        );
        updatePrinterState({ progress: calculatedProgress });
      }
    }


    else if (message.method === "notify_gcode_response") {
      // Handle direct GCODE responses (pause, resume, cancel)
      const response = message.params[0];
      if (response.includes("// PAUSE called with")) {
        updatePrinterState({ printStatus: 'paused' });
      } 
      else if (response.includes("// RESUME called with")) {
        updatePrinterState({ printStatus: 'printing' });
      }
    }


    else if (message.method === "notify_history_changed") {
      // Handle job history updates (completed prints, cancelled jobs, etc.)
      const historyData = message.params[0];
      if (historyData.action === "started") {
        // When a new print starts, reset progress and update status
        updatePrinterState({
          printStatus: 'printing',
          progress: 0,
          filename: historyData.job.filename,
          progress: 0,
          elapsedTime: 0,
          estimatedTime: metadata.estimated_time,
          fileDetails: historyData.job.metadata
        });
      }


      else if (historyData.action === "finished") {
        // When a print is finished, reset to idle state
        updatePrinterState({
          printStatus: 'idle',     // Current status: 'idle', 'printing', 'paused', etc.
          filename: null,          // Current file being printed
          progress: 0,             // Print progress (0-100)
          elapsedTime: 0,          // Time elapsed in seconds since print started
          estimatedTime: 0,        // Estimated total time in seconds
          fileDetails: null,       // Detailed file metadata
        });
      }
      
    }
  }, [updatePrinterState]);


  // When initialization is complete, set loading to false
  const completeInitialization = useCallback(() => {
    updatePrinterState({ isLoading: false });
  }, [updatePrinterState]);  


  // Initialize printer state automatically when the hook mounts
  useEffect(() => {
    // Only run initialization if sendMessage is available
    if (!socket) {
      console.warn("Cannot initialize printer, socket not open");
      return;
    }
    
    const initializeState = async () => {
      try {
        // Get server information
        const serverInfoResponse = await sendMessage("server.info", {});
        
        // Query printer objects to get current print status
        const printerObjectsResponse = await sendMessage("printer.objects.query", { 
          "objects": { "print_stats": null }
        });
        
        const printStats = printerObjectsResponse.status.print_stats;
        
        // Update printer state with initial values
        updatePrinterState({
          printStatus: printStats.state || 'idle',
          filename: printStats.filename,
          elapsedTime: printStats.print_duration || 0
        });
        
        // If we're printing a file, get its metadata
        if (printStats.filename) {
          const metadataResponse = await sendMessage("server.files.metadata", { 
            "filename": printStats.filename 
          });
          
          // Process file metadata directly here
          if (metadataResponse) {
            updatePrinterState({
              estimatedTime: metadataResponse.estimated_time || 0,
              fileDetails: metadataResponse
            });
          }
        }
        
        // Initialization complete
        completeInitialization();
        
      } catch (error) {
        console.error("Error initializing printer state:", error);
        completeInitialization();
      }
    };
    
    initializeState();
    
  }, [socket]);

  return {
    printerState,
    processWebSocketUpdate
  };
};
