import React, { useState } from 'react'; 
import HomeView from './views/HomeView';  
import PreparePrintView from './views/PreparePrintView';
//import PrintingView from './views/PrintingView';
//import Toast from './common/Toast';  

const PrinterUI = () => {
    // selectedView state controls which view is currently displayed
    // Initially set to 'home', it can be changed to 'print' or 'status'
    // setSelectedView is a function that lets you update the selectedView state
    const [selectedView, setSelectedView] = useState('prepare');

    // showToast state manages the visibility of toast notifications
    // Starts as false (hidden), can be toggled to show/hide notifications
    const [showToast, setShowToast] = useState(false);

    // printDetails state stores information about the current print
    // This is a static object in this example, but could be dynamic in a real app
    // Using useState even for static data allows for easy updates later
    const [printDetails] = useState({
        filename: 'benchy.gcode',  // Name of the file being printed
        printVolume: '50ml'        // Volume of the print
    });

    // Function to show the toast notification
    // Sets showToast to true, then uses a timeout to hide it after 3 seconds
    const handleToast = () => {
        setShowToast(true);  // Make the toast visible
        setTimeout(() => setShowToast(false), 3000);  // Hide toast after 3 seconds
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
                    setSelectedView={setSelectedView} 
                />
            )}
            
            {/* Print view - shown when selectedView is 'prepare' */}
            {selectedView === 'prepare' && (
                <PreparePrintView 
                    setSelectedView={setSelectedView}
                    printDetails={printDetails}
                    handleToast={handleToast}
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
            
            {/* Toast notification component *}
            {/* Shows a temporary notification with the filename when triggered *s}
            <Toast 
                show={showToast}  // Controls visibility based on showToast state
                message={`${printDetails.filename}, saved to history`}  // Notification message
            />
            */}
        </div>
        );
    };

export default PrinterUI;