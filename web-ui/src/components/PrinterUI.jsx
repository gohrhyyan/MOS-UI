import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Settings, History, Printer, Pause, Square, Clock, Play } from 'lucide-react';
import MOSLogo from '../assets/MOS.png';
import PrinterImage from '../assets/Printer.png';
import BenchyImage from '../assets/Benchy.png';
import gif from '../assets/3dprinting.gif';

const PrinterUI = () => {
  const [selectedView, setSelectedView] = useState('home');
  const [sliderValue, setSliderValue] = useState(2);
  const [showToast, setShowToast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [printStatus, setPrintStatus] = useState('printing');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [startTime, setStartTime] = useState(null);
  const [estimatedDuration] = useState(25000); // 25 seconds for demo
  
  // Print details (will come from API later)
  const [printDetails, setPrintDetails] = useState({
    filename: 'benchy.gcode',
    printVolume: '50ml'
  });

  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  useEffect(() => {
    if (selectedView === 'status' && !isPaused) {
      setStartTime(Date.now());
    }
  }, [selectedView, isPaused]);

  const handleBack = () => {
    setShowToast(true);
    setSelectedView('home');
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePauseResume = () => {
    setIsPaused(prevPaused => {
      // Use the new value of isPaused to set the correct status
      setPrintStatus(!prevPaused ? 'pausing' : 'resuming');
      setTimeout(() => {
        setPrintStatus(!prevPaused ? 'paused' : 'printing');
      }, 1000);
      return !prevPaused;
    });
  };
  

  const Toast = () => (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 
      bg-gray-800 text-white px-4 py-2 rounded-lg
      transition-opacity duration-300 ${showToast ? 'opacity-100' : 'opacity-0'}`}>
      {printDetails.filename}, saved to history
    </div>
  );

  const StopDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex gap-4">
          <button
            onClick={() => setShowStopDialog(false)}
            className="flex-1 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowStopDialog(false);
              setShowToast(true);
              setSelectedView('home');
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg"
          >
            STOP PRINT
          </button>
        </div>
      </div>
    </div>
  );

  const TopBar = ({ title, showBack = false }) => (
    <div className="w-full flex items-center justify-between p-4 border-b">
      {showBack ? (
        <button onClick={handleBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9" /> // Spacer for alignment
      )}
      <span className="text-lg font-medium">{title}</span>
      <div className="w-9" /> {/* Spacer for alignment */}
    </div>
  );


  // Updated ResponsiveContainer with new height calculation
  const ResponsiveContainer = ({ children }) => (
    <div className="w-full max-w-md mx-auto flex flex-col 
      px-4 sm:px-6 
      py-4 
      bg-white 
      relative
      h-[calc(var(--vh,1vh)*100)]">
      {children}
    </div>
  );

  const HomeView = () => (
    <ResponsiveContainer>
      <div className="flex-1 flex flex-col items-center justify-between">
        {/* Top section with more space */}
        <div className="w-full flex justify-center mb-12">
          <img 
            src={MOSLogo}
            alt="MOS Printing Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Middle section with larger printer image */}
        <div className="w-64 flex-1 flex items-center justify-center mb-12">
          <img 
            src={PrinterImage}
            alt="Printer Preview" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Bottom section with vertically stacked icons */}
        <div className="w-full flex items-center justify-center relative">
          <button 
            onClick={() => setSelectedView('print')} 
            className="flex flex-col items-center justify-center 
              gap-2 bg-gray-200 rounded-lg 
              px-6 py-3
              w-48
              text-gray-800 
              hover:bg-gray-300 
              active:bg-gray-400 
              transition-colors"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm text-gray-600">upload design</span>
          </button>

          {/* Vertically stacked side buttons */}
          <div className="absolute right-0 flex flex-col gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
              <History className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateAdjustedTime = (baseTimeMs, sliderPosition) => {
    const multipliers = [2, 1.5, 1, 1/1.5, 0.5];
    return baseTimeMs * multipliers[sliderPosition];
  };

  const PrintView = () => {
    const baseTimeMs = 30 * 60 * 1000;
    const adjustedTime = calculateAdjustedTime(baseTimeMs, sliderValue);

    return (
      <ResponsiveContainer>
        <TopBar title="Preview" showBack={true} />
        <div className="flex-1 flex flex-col p-4">
          <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2">
            <img 
              src={BenchyImage}
              alt="Print Thumbnail" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="text-lg mb-1 text-gray-800">
            {printDetails.filename}
            <div className="text-sm text-gray-500">{printDetails.printVolume}</div>
          </div>
          
          <div className="flex items-center justify-center mb-2 gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="text-2xl text-gray-800 dark:text-gray-200">
              {formatTime(adjustedTime)}
            </div>
          </div>
          
          <div className="space-y-4 mb-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>quality</span>
              <span>speed</span>
            </div>
            <div className="flex justify-between px-1">
              {[0, 1, 2, 3, 4].map((point) => (
                <div key={point} className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              ))}
            </div>
            <input 
              type="range" 
              min="0" 
              max="4" 
              value={sliderValue}
              step="1"
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <button 
            onClick={() => setSelectedView('status')}
            className="mt-auto w-full bg-gray-200 dark:bg-gray-800 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-800 dark:text-gray-200"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </ResponsiveContainer>
    );
  };

const StatusView = () => {
  // Calculate progress based on elapsed time
  const currentProgress = startTime && !isPaused ? 
    Math.min(((Date.now() - startTime) / estimatedDuration) * 100, 100) : 
    progress;

  return (
    <ResponsiveContainer>
      <TopBar title={printStatus.charAt(0).toUpperCase() + printStatus.slice(1)} />
      <div className="flex-1 flex flex-col p-4">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6">
          <img 
            src={gif}
            alt="Print Livestream" 
            className="w-full h-full object-cover rounded-lg"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          />
        </div>
        
        <div className="text-lg text-gray-800">{printDetails.filename}</div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={handlePauseResume}
            className="flex-1 bg-gray-200 rounded-lg py-3 flex items-center justify-center"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setShowStopDialog(true)}
            className="flex-1 bg-red-400 text-white rounded-lg py-3 flex items-center justify-center"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2"
              style={{ 
                width: `${currentProgress}%`,
                transition: 'width 0.3s linear'
              }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 mt-1">
            {Math.ceil((100 - currentProgress) / 4)} Min
          </div>
        </div>
      </div>
      {showStopDialog && <StopDialog />}
    </ResponsiveContainer>
  );
};

  return (
    <div className="h-screen flex flex-col bg-white overflow-x-hidden">
      {selectedView === 'home' && <HomeView />}
      {selectedView === 'print' && <PrintView />}
      {selectedView === 'status' && <StatusView />}
      <Toast />
    </div>
  );
};

export default PrinterUI;