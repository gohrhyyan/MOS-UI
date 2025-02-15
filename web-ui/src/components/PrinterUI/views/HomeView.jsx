import React from 'react';
import { Upload, Settings, History } from 'lucide-react';
import MOSLogo from '../../../assets/MOS.png';
import PrinterImage from '../../../assets/Printer.png';

// Import custom ResponsiveContainer component
import ResponsiveContainer from '../common/ResponsiveContainer';

// Define the HomeView component as a functional component
// Functional components are the modern way to write React components using functions
// The ({ setSelectedView }) is using "destructuring" to pull out the setSelectedView prop
// Props are how parent components pass data and functions to child components
const HomeView = ({ setSelectedView }) => (
  // Wrap the entire component in ResponsiveContainer for consistent layout
  <ResponsiveContainer>
    {/* Main container using flexbox for vertical layout */}
    <div className="flex-1 flex flex-col items-center justify-between">
      {/* Logo section - centered at the top */}
      <div className="w-full flex justify-center mb-12">
        <img 
          src={MOSLogo}
          alt="MOS Printing Logo" 
          className="h-16 w-auto"
        />
      </div>

      {/* Printer image section - takes up flexible space in the middle */}
      <div className="w-64 flex-1 flex items-center justify-center mb-12">
        <img 
          src={PrinterImage}
          alt="Printer Preview" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Action buttons section at the bottom */}
      <div className="w-full flex items-center justify-center relative">
        {/* Main upload button */}
        <button 
          // onClick is an event handler that triggers when the button is clicked
          // setSelectedView is a function passed as a prop from the parent component
          // When clicked, it changes the view to 'print' 
          // This is how React manages navigation/view changes without full page reloads
          onClick={() => setSelectedView('prepare')} 
          className="flex flex-col items-center justify-center gap-2 bg-gray-200 rounded-lg px-6 py-3 w-48 text-gray-800 hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          {/* Upload icon from lucide-react */}
          <Upload className="w-8 h-8" />
          {/* Button text */}
          <span className="text-sm text-gray-600">upload design</span>
        </button>

        {/* Sidebar buttons */}
        <div className="absolute right-0 flex flex-col gap-4">
          {/* Settings button */}
          <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* History button */}
          <button className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
            <History className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </ResponsiveContainer>
);

// Export the component as the default export
// This allows other files to import this component using: 
// import HomeView from './HomeView';
export default HomeView;