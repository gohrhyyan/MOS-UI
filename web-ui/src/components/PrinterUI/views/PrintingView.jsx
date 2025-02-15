import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import gif from '../../assets/3dprinting.gif';
import ResponsiveContainer from './common/ResponsiveContainer';
import TopBar from './common/TopBar';
import StopDialog from './common/StopDialog';
import { usePrintProgress } from '../hooks/usePrintProgress';

const PrintingView = ({ setSelectedView, printDetails, handleToast }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [printStatus, setPrintStatus] = useState('printing');
  
  const { 
    progress, 
    startTime, 
    handlePauseResume 
  } = usePrintProgress(isPaused, setPrintStatus);

  return (
    <ResponsiveContainer>
      <TopBar title={printStatus.charAt(0).toUpperCase() + printStatus.slice(1)} />
      <div className="flex-1 flex flex-col p-4">
        <PrintPreview 
          gif={gif} 
          isPaused={isPaused} 
          filename={printDetails.filename}
        />
        
        <ControlButtons 
          isPaused={isPaused}
          onPauseResume={handlePauseResume}
          onStop={() => setShowStopDialog(true)}
        />
        
        <ProgressBar 
          progress={progress}
          isPaused={isPaused}
          startTime={startTime}
        />
      </div>
      {showStopDialog && (
        <StopDialog 
          onCancel={() => setShowStopDialog(false)}
          onStop={() => {
            setShowStopDialog(false);
            handleToast();
            setSelectedView('home');
          }}
        />
      )}
    </ResponsiveContainer>
  );
};

export default PrintingView;