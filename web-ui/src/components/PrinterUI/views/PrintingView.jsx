// src/components/PrinterUI/PrintingView/index.jsx
import { fileUtils } from '../../utils/fileUtils';
import React, { useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import gif from '../../../assets/3dprinting.gif';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import StopDialog from '../common/StopDialog';
import { usePrintProgress } from '../../hooks/usePrintProgress';

const PrintPreview = ({ gif, isPaused, filename }) => (
  <div className="mb-6">
    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2">
      <img 
        src={gif}
        alt="Print Livestream" 
        className="w-full h-full object-cover rounded-lg"
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      />
    </div>
    <div className="text-lg text-gray-800">{filename}</div>
  </div>
);

const ControlButtons = ({ isPaused, onPauseResume, onStop }) => (
  <div className="flex gap-4 mt-4">
    <button 
      onClick={onPauseResume}
      className="flex-1 bg-gray-200 rounded-lg py-3 flex items-center justify-center"
    >
      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
    </button>
    <button 
      onClick={onStop}
      className="flex-1 bg-red-400 text-white rounded-lg py-3 flex items-center justify-center"
    >
      <Square className="w-5 h-5" />
    </button>
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="mt-6">
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 rounded-full h-2 transition-all duration-300 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-right text-sm text-gray-500 mt-1">
      {Math.ceil((100 - progress) / 4)} Min
    </div>
  </div>
);

const PrintingView = ({ setSelectedView, printDetails}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [printStatus, setPrintStatus] = useState('printing');
  const filename = fileUtils.getFilename(printDetails.path);
  
  const { 
    progress, 
    startTime, 
    handlePauseResume 
  } = usePrintProgress({
    isPaused,
    setIsPaused,
    setPrintStatus
  });

  return (
    <ResponsiveContainer>
      <TopBar title={printStatus.charAt(0).toUpperCase() + printStatus.slice(1)} />
      <div className="flex-1 flex flex-col p-4">
        <PrintPreview 
            gif={gif} 
            isPaused={isPaused} 
            filename={filename}
        />v
        
        <ControlButtons 
          isPaused={isPaused}
          onPauseResume={handlePauseResume}
          onStop={() => setShowStopDialog(true)}
        />
        
        <ProgressBar progress={progress} />
      </div>

      {showStopDialog && (
        <StopDialog 
          onCancel={() => setShowStopDialog(false)}
          onStop={() => {
            setShowStopDialog(false);
            setSelectedView('home');
          }}
        />
      )}
    </ResponsiveContainer>
  );
};

export default PrintingView;