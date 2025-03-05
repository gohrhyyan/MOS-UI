// src/components/hooks/usePrinterState.js
import { useState, useEffect, useCallback } from 'react';


// This hook centralizes all printer state management
export const usePrinterState = (socket, sendMessage) => {
  // Core printer state
  const [printerState, setPrinterState] = useState({
    printStatus: null,     // Current status: 'idle', 'printing', 'paused', etc.
    filename: null,          // Current file being printed
    elapsedTime: 0,          // Time elapsed in seconds since print started
    estimatedTime: 0,        // Estimated total time in seconds
  });


  // Function to update printer state - single source of truth
  // Takes in a partial state object and merges it with the current state
  const updatePrinterState = useCallback((newState) => {
    setPrinterState(currentState => ({
      ...currentState,
      ...newState
    }));
  }, [setPrinterState]);

  // function to refresh state HAVING A PRINTING OR PAUSED STATE IS THE ONLY VALID WAY TO SWITCH TO PRINTING VIEW.
  // IF HISTORY VIEW OR PREPARE PRINT VIEW WANTS TO SWITH TO PRINTING VIEW, IT SHOULD CALL THIS FUNCTION
  // TO REFRESH THE STATE, THEN INDEX WILL CHECK THE STATE AND SWITCH TO PRINTING VIEW
  const refreshState = useCallback(async () => {
    try {
      // Get server information
      const serverInfoResponse = await sendMessage("server.info", {});

      // Query printer objects to get current print status
      const printerObjectsResponse = await sendMessage("printer.objects.query", {"objects": { "print_stats": null }});

      // Update printer state with initial values
      updatePrinterState({printStatus: printerObjectsResponse.status.print_stats.state, 
        filename: printerObjectsResponse.status.print_stats.filename
      });
      
      // If we're printing a file, get its metadata
      if (printerObjectsResponse.status.print_stats.state === 'printing' || printerObjectsResponse.status.print_stats.state === 'paused') {
        const metadataResponse = await sendMessage("server.files.metadata", { 
           filename: printerObjectsResponse.status.print_stats.filename
        });
        
        updatePrinterState({
          estimatedTime: metadataResponse.estimated_time || 0,
          elapsedTime: printerObjectsResponse.status.print_stats.print_duration
        });
      }
      
    } catch (error) {console.error("Error refreshing printer state:", error);}
      return;
  }, [sendMessage]);


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
    }

    else if (message.method === "notify_gcode_response") {
      // Handle direct GCODE responses (pause, resume, cancel)
      const response = message.params[0];
      if (response.includes("// PAUSE called with")) {
        refreshState();
      } 
      else if (response.includes("// RESUME called with")) {
        refreshState();
      }
      else if (response.includes("File opened:")) {
        // When a new print starts, refresh the state
        refreshState()
      }
    }

    else if (message.method === "notify_history_changed") {
      // Handle job history updates (completed prints, cancelled jobs, etc.)
      const historyData = message.params[0];
      if (historyData.action === "started") {
        // other call for when a new print starts, refresh the state
        refreshState()
      }

      else if (historyData.action === "finished") {
        // When a print is finished, reset to idle state
        updatePrinterState({
          printStatus: 'idle',     // Current status: 'idle', 'printing', 'paused', etc.
          filename: null,          // Current file being printed
          elapsedTime: 0,          // Time elapsed in seconds since print started
          estimatedTime: 0        // Estimated total time in seconds
        });
      }
      
    }
  }, [updatePrinterState, refreshState]);



  // Initialize printer state automatically when the hook mounts
  useEffect(() => {
    // Only run initialization if sendMessage is available
    if (!socket) {
      console.warn("Cannot initialize printer, socket not open");
      return;
    }
      refreshState();
  }, [socket]);

  // Long in console whenver there is a change to state
  useEffect(() => {
    console.log("printer state updated", printerState)
  }, [printerState]);


  return {
    printerState,
    processWebSocketUpdate,
    refreshState
  };
};
