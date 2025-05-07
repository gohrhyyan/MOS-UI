import React from 'react';

const DPad = ({sendGCode, showToast}) => {
  // Constants for movement and extrusion distances
  const MOVE_DISTANCE = 10; // Distance for X, Y, Z movement and extrude/retract (mm)

  return (
    <div>
      <button
          onClick={() => sendGCode('G28')}
          className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors w-full mb-4"
        >
        Home Axes
        </button> 

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
  </div>
    )
}

export default DPad;