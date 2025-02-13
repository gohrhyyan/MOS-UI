import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Settings, History, Printer, Pause, Square, Clock } from 'lucide-react';
import MOSLogo from '../assets/MOS.png';
import PrinterImage from '../assets/Printer.png';

const PrinterUI = () => {
  const [selectedView, setSelectedView] = useState('home');
  const [sliderValue, setSliderValue] = useState(2); // Middle position (0-4)
  
  // Add useEffect to handle viewport height
  useEffect(() => {
    // Set initial height
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set height on mount
    setHeight();
    
    // Update height on resize
    window.addEventListener('resize', setHeight);
    
    // Cleanup
    return () => window.removeEventListener('resize', setHeight);
  }, []);

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
    // Local state for print view
    const [basePrintTimeMs, setBasePrintTimeMs] = useState(30 * 60 * 1000); // 30 minutes in ms
    const adjustedTime = calculateAdjustedTime(basePrintTimeMs, sliderValue);

    return (
      <ResponsiveContainer title="Print Settings">
        <div className="flex-1 flex flex-col">
          <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
            <img 
              src="/api/placeholder/256/256" 
              alt="Print Preview" 
              className="w-full h-full object-contain p-4"
            />
          </div>
          
          <div className="text-lg mb-2 text-gray-800 dark:text-gray-200">
            Benchy.gcode
            <div className="text-sm text-gray-500 dark:text-gray-400">50ml</div>
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
    <ResponsiveContainer title="Printing">
      <div className="flex-1 flex flex-col">
        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
          <img 
            src="/api/placeholder/256/256" 
            alt="Print Status" 
            className="w-full h-full object-contain p-4"
          />
        </div>
        
        <div className="text-lg text-gray-800 dark:text-gray-200">Benchy.gcode</div>
        
        <div className="flex gap-4 mt-4">
          <button className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg py-3 flex items-center justify-center text-gray-800 dark:text-gray-200">
            <Pause className="w-5 h-5" />
          </button>
          <button onClick={() => setSelectedView('home')} className="flex-1 bg-red-400 dark:bg-red-600 text-white rounded-lg py-3 flex items-center justify-center">
            <Square className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 dark:bg-blue-400 rounded-full h-2" 
              style={{ width: `${(sliderValue / 4) * 100}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">25 Min</div>
        </div>
      </div>
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