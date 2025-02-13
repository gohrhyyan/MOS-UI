import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Settings, History, Printer, Pause, Square, Clock, Play } from 'lucide-react';
import MOSLogo from '../assets/MOS.png';
import PrinterImage from '../assets/Printer.png';
import BenchyImage from '../assets/Benchy.png';
import gif from '../assets/3dprinting.gif';

const PrinterUI = () => {
  const [selectedView, setSelectedView] = useState('home');
  const [sliderValue, setSliderValue] = useState(2);
  const [printStatus, setPrintStatus] = useState('printing');
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gifRef = useRef(null);
  
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

  // Progress bar animation
  useEffect(() => {
    let interval;
    if (printStatus === 'printing' && !isPaused && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 0.1, 100));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [printStatus, isPaused, progress]);

  const handleBack = () => {
    setShowSavedMessage(true);
    setSelectedView('home');
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (gifRef.current) {
      if (isPaused) {
        gifRef.current.play();
      } else {
        gifRef.current.pause();
      }
    }
  };

  const TopBar = ({ title, showBack = false }) => (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200">
      {showBack ? (
        <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      ) : (
        <div className="w-6" /> // Spacer for alignment
      )}
      <span className="text-lg font-medium text-gray-800">{title}</span>
      <div className="w-6" /> {/* Spacer for alignment */}
    </div>
  );

  const ResponsiveContainer = ({ children, title, showBack }) => (
    <div className="w-full max-w-md mx-auto flex flex-col px-4 sm:px-6 py-4 bg-white relative h-[calc(var(--vh,1vh)*100)]">
      {title && <TopBar title={title} showBack={showBack} />}
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
    const basePrintTimeMs = 30 * 60 * 1000;
    const adjustedTime = calculateAdjustedTime(basePrintTimeMs, sliderValue);

    return (
      <ResponsiveContainer title="Preview" showBack={true}>
        <div className="flex-1 flex flex-col pt-4">
          <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            <img 
              src={BenchyImage}
              alt="Print Thumbnail" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
                  
          <div className="text-lg mb-2 text-gray-800">
            {printDetails.filename}
            <div className="text-sm text-gray-500">{printDetails.printVolume}</div>
          </div>
          
          <div className="flex items-center justify-center mb-6 gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="text-2xl text-gray-800 dark:text-gray-200">
              {formatTime(adjustedTime)}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>precision</span>
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

  const StatusView = () => (
    <ResponsiveContainer title={printStatus}>
      <div className="flex-1 flex flex-col pt-4">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
          <img 
            ref={gifRef}
            src={gif}
            alt="Print Livestream" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className="text-lg text-gray-800">{printDetails.filename}</div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={handlePause}
            className="flex-1 bg-gray-200 rounded-lg py-3 flex items-center justify-center text-gray-800"
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
              className="bg-blue-500 rounded-full h-2 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 mt-1">25 Min</div>
        </div>
      </div>

      {/* Stop Print Dialog */}
      {showStopDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stop Print?</h3>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowStopDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowStopDialog(false);
                  setSelectedView('home');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                STOP PRINT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Message Toast */}
      {showSavedMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-opacity duration-300">
          {printDetails.filename}, saved to history
        </div>
      )}
    </ResponsiveContainer>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-x-hidden">
      {selectedView === 'home' && <HomeView />}
      {selectedView === 'print' && <PrintView />}
      {selectedView === 'status' && <StatusView />}
    </div>
  );
};

export default PrinterUI;