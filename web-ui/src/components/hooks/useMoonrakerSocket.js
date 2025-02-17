import { useState, useEffect, useCallback } from 'react';

const RECONNECT_DELAY = 5000;

const useMoonrakerSocket = () => {
  const [socket, setSocket] = useState(null);
  const [printerState, setPrinterState] = useState(null);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/websocket`;
      
      console.log('Attempting to connect to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = async () => {
        console.log('WebSocket connected successfully');
        setSocket(ws);
        setError(null);
        
        ws.send(JSON.stringify({
          "jsonrpc": "2.0",
          "method": "server.info",
          "id": 1
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.result?.klippy_state) {
            const { klippy_state } = data.result;
            setPrinterState(klippy_state);
            
            if (klippy_state === 'ready') {
              ws.send(JSON.stringify({
                "jsonrpc": "2.0",
                "method": "printer.objects.subscribe",
                "params": {
                  "objects": {
                    "print_stats": null,
                    "virtual_sdcard": null
                  }
                },
                "id": 2
              }));
            }
          } else if (data.method === 'notify_klippy_disconnected') {
            console.log('Klippy disconnected');
            setPrinterState('disconnected');
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed with code:', event.code);
        setPrinterState(null);
        setSocket(null);         
        setTimeout(() => connect(), RECONNECT_DELAY);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
      };
    } catch (err) {
      console.error('Error establishing WebSocket connection:', err);
      setError(err.message);
    }
  }); 

  const sendMessage = useCallback((method, params = {}) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": Date.now()
      }));
    } else {
      console.warn('Attempted to send message while socket is not open');
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return {
    printerState,
    sendMessage
  };
};

export default useMoonrakerSocket;