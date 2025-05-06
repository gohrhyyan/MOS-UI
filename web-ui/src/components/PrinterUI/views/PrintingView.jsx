// src/components/PrinterUI/views/PrintingView.jsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';

const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

// Component for showing the print preview with animation
const PrintPreview = ({ filename }) => (
  <div className="mb-6">
    <div className="w-full aspect-square rounded-lg mb-2">
      <img 
        src={`${protocol}//${window.location.host}/stream`}
        alt="Print Livestream" 
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
    <div className="text-lg">{filename || 'Unknown File'}</div>
  </div>
);

// Component for the pause/resume and stop buttons
const ControlButtons = ({ isPaused, onPauseResume, onStop, isPending }) => (
  <div className="flex gap-4 mt-4">
    <button 
      onClick={onPauseResume}
      className={`flex-1 rounded-lg py-3 flex items-center justify-center ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isPending}
    >
      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
    </button>
    <button 
      onClick={onStop}
      className={`flex-1 bg-red-500 text-white rounded-lg py-3 flex items-center justify-center ${
        isPending ? 'opacity-50 cursor-not-allowed' : 'active:bg-red-600'
      }`}
      disabled={isPending}
    >
      <Square className="w-5 h-5" />
    </button>
  </div>
);

// Component for the progress bar and remaining time
const ProgressBar = ({ progress, remainingTime }) => (
  <div className="mt-6">
    <div style={{ backgroundColor: 'var(--button-background)' }} className="w-full rounded-full h-2">
      <div 
        className="bg-blue-500 rounded-full h-2 transition-all duration-300 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-right text-sm mt-1">
      {remainingTime} remaining
    </div>
  </div>
);

const StopDialog = ({ onCancel, onStop }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div style={{ backgroundColor: 'var(--background-color)' }} className="bg-background-color rounded-lg p-6 max-w-sm w-full">
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onStop}
          className="flex-1 py-2 bg-red-500 rounded-lg"
        >
          STOP PRINT
        </button>
      </div>
    </div>
  </div>
);

// Main PrintingView component
const PrintingView = ({ setSelectedView, printerState, sendMessage, refreshState }) => {
  // State for managing the stop dialog visibility
  const [showStopDialog, setShowStopDialog] = useState(false);
  
  // State for tracking pending pause/resume operations
  const [pendingState, setPendingState] = useState(null);
  
  // Calculate if the printer is paused based on the printer state
  const isPaused = printerState.printStatus === 'paused';
  
  // Check if there's a pending operation
  const isPending = pendingState !== null;
  
  // Calculate progress percentage based on elapsed time and estimated time
  const calculateProgress = () => {
    if (!printerState.estimatedTime) return 0;
    const progress = (printerState.elapsedTime / printerState.estimatedTime) * 100;
    return Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0-100
  };
  
  // Format remaining time as minutes and seconds
  const formatRemainingTime = () => {
    if (!printerState.estimatedTime) return 'Calculating...';
    
    const remainingSeconds = Math.max(0, printerState.estimatedTime - printerState.elapsedTime);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    
    return `${minutes}m ${seconds}s`;
  };
  
  // Handle pause/resume button click
  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        // Show pending state while waiting for printer to resume
        setPendingState('resuming');
        // Send resume command
        await sendMessage('printer.print.resume', {});
      } else {
        // Show pending state while waiting for printer to pause
        setPendingState('pausing');
        // Send pause command
        await sendMessage('printer.print.pause', {});
      }
      // Refresh printer state to get updated status
      await refreshState();
      // Clear pending state after a short delay to ensure the state has updated
      setTimeout(() => setPendingState(null), 1000);
    } catch (error) {
      console.error('Error toggling pause/resume:', error);
      // Clear pending state on error
      setPendingState(null);
    }
  };
  
  // Handle stop print button confirmation
  const handleStopPrint = async () => {
    try {
      // Set pending state for stopping
      setPendingState('stopping');
      // Send cancel command to the printer
      await sendMessage('printer.print.cancel', {});
      setShowStopDialog(false);
      // Refresh state after stopping the print
      await refreshState();
      // Clear pending state
      setPendingState(null);
    } catch (error) {
      console.error('Error stopping print:', error);
      setPendingState(null);
    }
  };

  return (
    <ResponsiveContainer>
      {/* Top bar showing the current print status */}
      <TopBar 
        title={
          pendingState ? 
            (pendingState.charAt(0).toUpperCase() + pendingState.slice(1)) : 
            (printerState.printStatus.charAt(0).toUpperCase() + printerState.printStatus.slice(1))
        } 
        onBack={() => setSelectedView('home')}
      />
      
      <div className="flex-1 flex flex-col p-4">
        {/* Print preview showing the GIF and filename */}
        <PrintPreview 
          filename={printerState.filename}
        />
        
        {/* Control buttons for pause/resume and stop */}
        <ControlButtons 
          isPaused={isPaused}
          onPauseResume={handlePauseResume}
          onStop={() => setShowStopDialog(true)}
          isPending={isPending}
        />
        
        {/* Progress bar showing completion percentage and remaining time */}
        <ProgressBar 
          progress={calculateProgress()} 
          remainingTime={formatRemainingTime()}
        />
      </div>

      {/* Stop dialog confirmation popup */}
      {showStopDialog && (
        <StopDialog 
          onCancel={() => setShowStopDialog(false)}
          onStop={handleStopPrint}
          disabled={isPending}
        />
      )}
    </ResponsiveContainer>
  );
};

export default PrintingView;