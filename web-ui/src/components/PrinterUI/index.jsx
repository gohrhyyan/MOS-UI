import React, { useEffect, useState, useCallback } from 'react'; 
import HomeView from './views/HomeView';  
import PreparePrintView from './views/PreparePrintView';
import PrintingView from './views/PrintingView';
import HistoryView from './views/HistoryView';
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

    // Initialize WebSocket connection, get state information and sendMessage function
    const { sendMessage, socket, getPrinterStates } = useMoonrakerSocket();

    const [currentFiles, setCurrentFiles] = useState([]);

    
    // Function to show the toast notification
    // Sets showToast to true, then uses a timeout to hide it after 3 seconds
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAlreadyPrinting = useCallback((stateInfo) => {
        // If the printer is printing, set the print details and selected view accordingly
        switch(stateInfo.printStats.state) {
            case "printing":
                setPrintDetails({ path: stateInfo.printStats.filename });
                setSelectedView('printing');
                setIsPaused(false);
                break;
            case "paused":
                setPrintDetails({ path: stateInfo.printStats.filename });
                setSelectedView('printing');
                setIsPaused(true);
                break;
            default:
                break;
        }
    }, []);

    // Call the getKlippyState function when component mounts or socket changes
    useEffect(() => {
        // Only proceed if socket exists
        if (!socket) return;
        
        // Start the async process but don't try to capture the return value directly
        getPrinterStates()
            .then(stateInfo => {
                // This code runs after the Promise resolves                
                // If we're already printing, handle that state
                if (stateInfo) {
                    handleAlreadyPrinting(stateInfo);
                }
            })
            .catch(error => {
                console.error("Error fetching printer states:", error);
            });
            
        // Note: We're NOT trying to capture the return value of getPrinterStates() directly
    }, [socket]);

    
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
                    currentFiles = {currentFiles}
                    setCurrentFiles = {setCurrentFiles}
                    sendMessage = {sendMessage}
                    socket = {socket}
                />
            )}
            
            {/* Print view - shown when selectedView is 'prepare' */}
            {selectedView === 'prepare' && (
                <PreparePrintView 
                    setSelectedView={setSelectedView}
                    printDetails={printDetails}
                    sendMessage={sendMessage}
                    showToast={showToast}
                />
            )}
            
            {/* Status view - shown when selectedView is 'printing' */}
            {selectedView === 'printing' && (
                <PrintingView
                    setSelectedView={setSelectedView}
                    printDetails={printDetails}
                    isPaused={isPaused}
                    setIsPaused={setIsPaused}

                />
            )}

            {selectedView === 'history' && (
                <HistoryView
                    setSelectedView={setSelectedView}
                    currentFiles={currentFiles}
                    setPrintDetails={setPrintDetails}
                />
            )}
            
            {/* Shows a temporary notification with the filename when triggered */}
            <Toast message={toastMessage} />

        </div>
        );
    };

export default PrinterUI;