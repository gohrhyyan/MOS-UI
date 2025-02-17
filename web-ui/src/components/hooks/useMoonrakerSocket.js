import { useState, useEffect, useCallback, useRef } from 'react';

const RECONNECT_DELAY = 5000;
const MESSAGE_TIMEOUT = 10000;

const useMoonrakerSocket = () => {
  const [socket, setSocket] = useState(null);
  const [printerState, setPrinterState] = useState(null);
  const [error, setError] = useState(null);
  
  // Use refs for pending messages to avoid race conditions
  const pendingMessagesRef = useRef(new Map());
  // Use ref for messageId to ensure unique IDs across reconnections
  const messageIdRef = useRef(1);

  const clearPendingMessages = (error) => {
    pendingMessagesRef.current.forEach(({ reject }) => {
      reject(error || new Error('Connection closed'));
    });
    pendingMessagesRef.current.clear();
  };filename

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/websocket`;
      
      console.log('Connecting to Moonraker:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
        setError(null);
        
        // Query initial server info
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          method: "server.info",
          id: messageIdRef.current++
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Ignore proc_stat_update notifications
          if (data.method === 'notify_proc_stat_update') {
            return;
          }
          console.log('Received:', data);
          
          if (data.id) {
            const pendingMessage = pendingMessagesRef.current.get(data.id);
            if (pendingMessage) {
              const { resolve, reject, timeoutId } = pendingMessage;
              
              // Clear timeout since we got a response
              clearTimeout(timeoutId);
              
              if (data.error) {
                reject(new Error(data.error.message || 'Unknown error'));
              } else {
                resolve(data.result);
              }
              
              pendingMessagesRef.current.delete(data.id);
            }
          }
          
          // Handle printer state updates
          if (data.method === 'notify_status_update') {
            if (data.params[0]?.status?.print_stats?.state) {
              setPrinterState(data.params[0].status.print_stats.state);
            }
          } else if (data.method === 'notify_klippy_disconnected') {
            setPrinterState('disconnected');
          }
          
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code);
        setSocket(null);
        setPrinterState(null);
        
        clearPendingMessages(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
        
        // Attempt to reconnect
        setTimeout(() => connect(), RECONNECT_DELAY);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
      };

    } catch (err) {
      console.error('Failed to establish connection:', err);
      setError(err.message);
    }
  }, []);

  const sendMessage = useCallback((method, params = {}) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      const id = messageIdRef.current++;
      const message = {
        jsonrpc: "2.0",
        method,
        params,
        id
      };

      // Set up timeout for this message
      const timeoutId = setTimeout(() => {
        if (pendingMessagesRef.current.has(id)) {
          pendingMessagesRef.current.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, MESSAGE_TIMEOUT);

      // Store promise handlers and timeout ID
      pendingMessagesRef.current.set(id, {
        resolve,
        reject,
        timeoutId
      });

      try {
        socket.send(JSON.stringify(message));
        console.log('Sent:', message);
      } catch (err) {
        clearTimeout(timeoutId);
        pendingMessagesRef.current.delete(id);
        reject(err);
      }
    });
  }, [socket]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
        clearPendingMessages();
      }
    };
  }, [connect]);

  return {
    printerState,
    sendMessage,
    socket,
    error
  };
};

export default useMoonrakerSocket;