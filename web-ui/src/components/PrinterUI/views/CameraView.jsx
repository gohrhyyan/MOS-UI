// src/components/PrinterUI/views/PrintingView.jsx
import ResponsiveContainer from '../common/ResponsiveContainer';
import TopBar from '../common/TopBar';

const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

// Component for showing the print preview with animation
const PrintPreview = () => (
  <div className="mb-6">
    <div className="w-full aspect-square rounded-lg mb-2">
      <img 
        src={`${protocol}//${window.location.host}/stream`}
        alt="Print Livestream" 
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  </div>
);

// Main PrintingView component
const CameraView = ({ setSelectedView, printerState }) => {
  return (
    <ResponsiveContainer>
      {/* Top bar showing the current print status */}
      <TopBar 
        title={
          pendingState ? 
            (pendingState.charAt(0).toUpperCase() + pendingState.slice(1)) : 
            (printerState.printStatus.charAt(0).toUpperCase() + printerState.printStatus.slice(1))
        } 
        onBack={() => setSelectedView('home')}
      />
      
      <div className="flex-1 flex flex-col p-4">
        {/* Print preview showing the GIF and filename */}
        <PrintPreview/>
      </div>
    </ResponsiveContainer>
  );
};

export default CameraView;