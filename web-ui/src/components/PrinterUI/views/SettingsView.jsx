// src/components/PrinterUI/views/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import DPad from '../common/DPad';


// Main SettingsView component
const SettingsView = ({klippyState, setSelectedView, sendMessage, sendGCode, showToast}) => {

// Component for showing the print preview with animation
const handleRestart = async () => {
  const response = await sendMessage("printer.firmware_restart");
};

const handleBack = () => {
  sendGCode('M84')
  setSelectedView('home')
}


  return (
    <ResponsiveContainer className="flex flex-col items-center justify-center p-6 gap-6">
      <TopBar
        title="Settings" 
        showBack={true} 
        onBack={() => handleBack()}
        
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

      <button
        onClick={() => sendGCode('G28 DELTA_CALIBRATE METHOD=manual')}
        className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors mb-4"
      >
       Calibrate Kinematics
      </button>

    <DPad
      sendGCode={sendGCode}
      showToast={showToast}
    />

    </ResponsiveContainer>
  )
};

export default SettingsView;