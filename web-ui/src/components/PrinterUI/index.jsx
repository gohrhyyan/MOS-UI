import React, { useEffect, useState, useCallback, useRef } from 'react'; 
import HomeView from './views/HomeView';  
import PreparePrintView from './views/PreparePrintView';
import PrintingView from './views/PrintingView';
import HistoryView from './views/HistoryView';
import Toast from './common/Toast'; 
import useMoonrakerSocket from '../hooks/useMoonrakerSocket'; 
import { usePrinterState } from '../hooks/usePrinterState';

const PrinterUI = () => {

    // Controls which view is currently displayed
    const [selectedView, setSelectedView] = useState('home');

    // Toast state, null when hidden, string message when shown.
    const [toastMessage, setToastMessage] = useState(null);

    // Create a relay callback ref for passing messages to printer state
    const relayFunctionRef = useRef(() => {});

    // Initialize WebSocket connection, get state information and sendMessage function
    const { sendMessage, socket, error } = useMoonrakerSocket((data) => relayFunctionRef.current(data));

    // Initialize printer state management
    const { printerState, processWebSocketUpdate, refreshState } = usePrinterState(socket, sendMessage);

    // set up the relay function once processWebSocketUpdate is available
    useEffect(() => {
        relayFunctionRef.current = processWebSocketUpdate;
    }, [processWebSocketUpdate]);

    const [currentFiles, setCurrentFiles] = useState([]);
    const [selectedFilePath, setSelectedFilePath] = useState(null);

    // Function to show the toast notification
    // Sets showToast to true, then uses a timeout to hide it after 3 seconds
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Update the view based on printer state changes
    useEffect(() => {
        if (printerState.printStatus === 'printing' || printerState.printStatus === 'paused') {
            setSelectedView('printing');
        }
        else {
            setSelectedView('home');
        }
    }, [printerState.printStatus]);

    // Refresh state when socket connection is established
    useEffect(() => {
            refreshState();
    }, []);

    
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
                    selectedFilePath = {selectedFilePath}
                    setSelectedFilePath = {setSelectedFilePath}
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
                    selectedFilePath={selectedFilePath}
                    sendMessage={sendMessage}
                    showToast={showToast}
                    refreshState={refreshState}
                />
            )}
            
            {/* Status view - shown when selectedView is 'printing' */}
            {selectedView === 'printing' && (
                <PrintingView
                    setSelectedView={setSelectedView}
                    printerState={printerState}
                    sendMessage={sendMessage}
                    refreshState={refreshState}
                />
            )}

            {selectedView === 'history' && (
                <HistoryView
                    setSelectedView={setSelectedView}
                    currentFiles={currentFiles}
                    setSelectedFilePath={setSelectedFilePath}
                />
            )}
            
            {/* Shows a temporary notification with the filename when triggered */}
            <Toast message={toastMessage} />

        </div>
        );
    };

export default PrinterUI;