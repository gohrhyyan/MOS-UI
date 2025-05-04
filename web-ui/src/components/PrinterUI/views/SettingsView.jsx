// src/components/PrinterUI/views/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';

// Main SettingsView component
const SettingsView = ({printerState, klippyState, setSelectedView, showToast, sendMessage, socket}) => {

// Component for showing the print preview with animation
const handleRestart = async () => {
  const response = await sendMessage("printer.firmware_restart");
};

  return (
    <ResponsiveContainer className="flex flex-col items-center justify-center p-6 gap-6">
      <TopBar
        title="Settings" 
        showBack={true} 
        onBack={() => setSelectedView('home')}
        
      />

      <div className="flex items-center justify-center mt-4 mb-4">
        <span className={`text-sm font-medium ${klippyState === 'ready' ? 'text-green-500' : 'text-red-500'}`}>
          {klippyState[0]?.toUpperCase() + klippyState?.slice(1)}
        </span>
      </div>

      <button
        onClick={handleRestart}
        className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors mb-4"
      >
        Restart Firmware
      </button>
    </ResponsiveContainer>
  )
};

export default SettingsView;