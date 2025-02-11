import React, { useState } from 'react';
import { ArrowLeft, Upload, Settings, History, Printer, Pause, Square } from 'lucide-react';
import MOSLogo from '../assets/MOS.png'; 
import PrinterImage from '../assets/Printer.png'

const PrinterUI = () => {
  const [selectedView, setSelectedView] = useState('home'); // home, print, status
  const [sliderValue, setSliderValue] = useState(50);
  const [printTime, setPrintTime] = useState('30 Min');

  const HomeView = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Logo */}
        <div className="w-full flex justify-center mb-12">
          <img 
            src={MOSLogo}
            alt="MOS Printing Logo" 
            className="h-16 w-auto"
          />
        </div>
        {/* Side Icons */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <History className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="w-64 h-128 rounded-lg flex items-center justify-center mb-8">
          <img 
            src={PrinterImage}
            alt="Printer Preview" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <button onClick={() => setSelectedView('print')} className="flex flex-col items-center justify-center gap-2 bg-gray-200 rounded-lg px-6 py-3 mb-4 w-48 text-gray-800">
          <Upload className="w-8 h-8" />
          <span className="text-sm text-gray-600">upload design</span>
        </button>
      </div>
    </div>
  );

  const PrintView = () => (
    <div className="flex flex-col h-full p-4">
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
      
      <button className="mt-auto w-full bg-gray-200 rounded-lg py-3 flex items-center justify-center gap-2">
        <Printer className="w-5 h-5" />
        Print
      </button>
    </div>
  );

  const StatusView = () => (
    <div className="flex flex-col h-full p-4">
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
  );

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {selectedView === 'home' && <HomeView />}
      {selectedView === 'print' && <PrintView />}
      {selectedView === 'status' && <StatusView />}
    </div>
  );
};

export default PrinterUI;