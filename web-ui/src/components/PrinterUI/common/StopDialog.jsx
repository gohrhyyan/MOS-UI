import React from 'react';

const StopDialog = ({ onCancel, onStop }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onStop}
          className="flex-1 py-2 bg-red-500 text-white rounded-lg"
        >
          STOP PRINT
        </button>
      </div>
    </div>
  </div>
);

export default StopDialog;