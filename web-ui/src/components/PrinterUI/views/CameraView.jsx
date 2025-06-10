// src/components/PrinterUI/views/PrintingView.jsx
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';
import DPad from '../common/DPad';


const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

// Component for showing the print preview with animation
const PrintPreview = () => (
  <div className="mb-6">
    <div className="w-full aspect-square rounded-lg">
      <img 
        src={`${protocol}//${window.location.host}/stream`}
        alt="Print Livestream" 
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  </div>
);

// Main PrintingView component
const CameraView = ({ setSelectedView, sendGCode, showToast}) => {

  const handleBack = () => {
    sendGCode('M84')
    setSelectedView('home')
  }

  return (
    <ResponsiveContainer>
      {/* Top bar showing the current print status */}
      <TopBar 
        title={`Live View`} 
        showBack={true} 
        onBack={() => handleBack()}
      />
      
      <div className="flex-1 flex flex-col p-4">
        <PrintPreview/>
      </div>
      <DPad
      sendGCode={sendGCode}
      showToast={showToast}
    />
    </ResponsiveContainer>
  );
};

export default CameraView;