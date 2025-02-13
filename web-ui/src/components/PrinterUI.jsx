import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Settings, History, Printer, Pause, Square } from 'lucide-react';
import MOSLogo from '../assets/MOS.png';
import PrinterImage from '../assets/Printer.png';

const PrinterUI = () => {
  const [selectedView, setSelectedView] = useState('home');
  const [sliderValue, setSliderValue] = useState(50);
  const [printTime, setPrintTime] = useState('30 Min');
  
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

  const PrintView = () => (
    <ResponsiveContainer>
      {/* Back button */}
      <button 
        onClick={() => setSelectedView('home')}
        className="mb-4 p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
          <img 
            src="/api/placeholder/256/256" 
            alt="Print Preview" 
            className="w-full h-full object-contain p-4"
          />
        </div>
        
        <div className="text-lg mb-2">
          Benchy.gcode
          <div className="text-sm text-gray-500">50ml</div>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <div className="text-2xl">{printTime}</div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>speed</span>
            <span>precision</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue}
            onChange={(e) => setSliderValue(e.target.value)}
            className="w-full"
          />
        </div>
        
        <button 
          onClick={() => setSelectedView('status')}
          className="mt-auto w-full bg-gray-200 rounded-lg py-3 flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
      </div>
    </ResponsiveContainer>
  );

  const StatusView = () => (
    <ResponsiveContainer>
      {/* Back button */}
      <button 
        onClick={() => setSelectedView('print')}
        className="mb-4 p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
          <img 
            src="/api/placeholder/256/256" 
            alt="Print Status" 
            className="w-full h-full object-contain p-4"
          />
        </div>
        
        <div className="text-lg">Benchy.gcode</div>
        
        <div className="flex gap-4 mt-4">
          <button className="flex-1 bg-gray-200 rounded-lg py-3 flex items-center justify-center">
            <Pause className="w-5 h-5" />
          </button>
          <button className="flex-1 bg-red-400 text-white rounded-lg py-3 flex items-center justify-center">
            <Square className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${sliderValue}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 mt-1">25 Min</div>
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