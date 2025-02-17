import React, { useState } from 'react'; 
import HomeView from './views/HomeView';  
import PreparePrintView from './views/PreparePrintView';
//import PrintingView from './views/PrintingView';
import Toast from './common/Toast'; 
import useMoonrakerSocket from '../hooks/useMoonrakerSocket'; 

// TEMP
import BenchyImage from '../../assets/Benchy.png';

const PrinterUI = () => {
    // STATE MANAGEMENT

    // Controls which view is currently displayed
    const [selectedView, setSelectedView] = useState('home');

    // Toast state, null when hidden, string message when shown.
    const [toastMessage, setToastMessage] = useState(null);

    // Stores information about the current print
    const [printDetails, setPrintDetails] = useState(null);

    // Initialize WebSocket connection
    const { printerState, sendMessage } = useMoonrakerSocket();

    // Function to show the toast notification
    // Sets showToast to true, then uses a timeout to hide it after 3 seconds
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };


    // The main render method - describes what the component looks like
    // In JavaScript, the && operator returns the second operand if the first is truthy.
    return (
        // Full-height flex container with white background and hidden horizontal overflow
        <div className="h-screen flex flex-col bg-white overflow-x-hidden">
            {/* Conditional rendering of views based on selectedView state */}
            {/* Only the selected view will be rendered */}
            
            {/* Home view - shown when selectedView is 'home' */}
            {selectedView === 'home' && (
                <HomeView     
                    setSelectedView = {setSelectedView}
                    showToast = {showToast}
                    setPrintDetails = {setPrintDetails}
                    printerState={printerState}
                />
            )}
            
            {/* Print view - shown when selectedView is 'prepare' */}
            {selectedView === 'prepare' && (
                <PreparePrintView 
                    setSelectedView={setSelectedView}
                    printDetails={printDetails}
                    showToast={showToast}
                />
            )}
            
            {/* Status view - shown when selectedView is 'printing' */}
            {selectedView === 'printing' && (
                <PrintingView
                    setSelectedView={setSelectedView}
                    printDetails={printDetails}
                    handleToast={handleToast}
                />
            )}
            
            {/* Shows a temporary notification with the filename when triggered */}
            <Toast message={toastMessage} />

        </div>
        );
    };

export default PrinterUI;