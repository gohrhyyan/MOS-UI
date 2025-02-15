import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import QualitySpeedSlider from '../common/QualitySpeedSlider';
import BenchyImage from '../../../assets/Benchy.png';
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import { calculateAdjustedTime } from '../../utils/timeUtils';

const PreparePrintView = ({ setSelectedView, printDetails, handleToast }) => {
  const [sliderValue, setSliderValue] = useState(2);
  const baseTimeMs = 30 * 60 * 1000;
  const adjustedTime = calculateAdjustedTime(baseTimeMs, sliderValue);

  return (
    <ResponsiveContainer>
      <TopBar 
        title="Preview" 
        showBack={true} 
        onBack={() => setSelectedView('home')}
      />
      <div className="flex-1 flex flex-col p-4">
        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2">
          <img 
            src={BenchyImage}
            alt="Print Thumbnail" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className="text-lg mb-1 text-gray-800">
          {printDetails.filename}
          <div className="text-sm text-gray-500">{printDetails.printVolume}</div>
        </div>
        
        <QualitySpeedSlider 
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          adjustedTime={adjustedTime}
        />
        
        <button 
          onClick={() => setSelectedView('printing')}
          className="mt-auto w-full bg-gray-200 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-800"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
      </div>
    </ResponsiveContainer>
  );
};

export default PreparePrintView;