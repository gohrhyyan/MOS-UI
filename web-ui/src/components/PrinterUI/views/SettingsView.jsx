// src/components/PrinterUI/views/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';

  // Constants for movement and extrusion distances
  const MOVE_DISTANCE = 10; // Distance for X, Y, Z movement and extrude/retract (mm)

// Main SettingsView component
const SettingsView = ({printerState, klippyState, setSelectedView, showToast, sendMessage, socket}) => {

// Component for showing the print preview with animation
const handleRestart = async () => {
  const response = await sendMessage("printer.firmware_restart");
};

const sendGCode = async (GCode) => {
  try{
  const response = await sendMessage("printer.gcode.script",{
        "script": `${GCode}`}
    )
  }
  catch(error){
    showToast(error.message);
  }
}

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
        onClick={() => sendGCode('G28')}
        className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors mb-4"
      >
       Home Axes
      </button>

       {/* D-pad and Z-axis controls */}
       <div className="flex w-full justify-center gap-4 mb-4">
        {/* X/Y D-pad */}
        <div className="grid grid-cols-3 grid-rows-3 w-32 h-32">
          <button
            onClick={() => sendGCode(`G91\nG1 Y${MOVE_DISTANCE}`)}
            className="col-start-2 row-start-1 flex items-center justify-center rounded-lg transition-colors"
          >
            ↑ Y+
          </button>
          <button
            onClick={() => sendGCode(`G91\nG1 X-${MOVE_DISTANCE}`)}
            className="col-start-1 row-start-2 flex items-center justify-center rounded-lg transition-colors"
          >
            ← X-
          </button>
          <button
            onClick={() => sendGCode(`G91\nG1 X${MOVE_DISTANCE}`)}
            className="col-start-3 row-start-2 flex items-center justify-center rounded-lg transition-colors"
          >
            → X+
          </button>
          <button
            onClick={() => sendGCode(`G91\nG1 Y-${MOVE_DISTANCE}`)}
            className="col-start-2 row-start-3 flex items-center justify-center rounded-lg transition-colors"
          >
            ↓ Y-
          </button>
        </div>

        {/* Z-axis stacked buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => sendGCode(`G91\nG1 Z${MOVE_DISTANCE}`)}
            className="flex items-center justify-center rounded-lg px-4 py-3 transition-colors"
          >
            Z+ ↑
          </button>
          <button
            onClick={() => sendGCode(`G91\nG1 Z-${MOVE_DISTANCE}`)}
            className="flex items-center justify-center rounded-lg px-4 py-3 transition-colors"
          >
            Z- ↓
          </button>
        </div>
      </div>

      {/* Extrude and Retract buttons */}
      <div className="flex w-full justify-center gap-4 mb-4">
        <button
          onClick={() => sendGCode(`G91\nG1 E${MOVE_DISTANCE}`)}
          className="flex items-center justify-center rounded-lg px-6 py-3 transition-colors"
        >
          Extrude
        </button>
        <button
          onClick={() => sendGCode(`G91\nG1 E-${MOVE_DISTANCE}`)}
          className="flex items-center justify-center rounded-lg px-6 py-3 transition-colors"
        >
          Retract
        </button>
      </div>

      <button
        onClick={() => sendGCode('G28 DELTA_CALIBRATE METHOD=manual')}
        className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors mb-4"
      >
       Calibrate Kinematics
      </button>

    </ResponsiveContainer>
  )
};

export default SettingsView;