import React from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';

const QualitySpeedSlider = ({ sliderValue, setSliderValue, adjustedTime }) => {
  return (
    <div className="space-y-4 mb-2">
      <div className="flex items-center justify-center mb-2 gap-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <div className="text-2xl text-gray-800">
          {formatTime(adjustedTime)}
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>quality</span>
        <span>speed</span>
      </div>
      
      <div className="flex justify-between px-1">
        {[0, 1, 2, 3, 4].map((point) => (
          <div 
            key={point} 
            className="w-1 h-1 bg-gray-300 rounded-full" 
          />
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
  );
};

export default QualitySpeedSlider;