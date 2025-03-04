import { useState, useEffect, useCallback, useRef } from 'react';

const RECONNECT_DELAY = 5000;
const MESSAGE_TIMEOUT = 10000;

// handle the connection to the Moonraker websocket
// a websocket is like an api, but it's a sustained, two-way connection
const useMoonrakerSocket = () => {

  //initialise states for the socket, printer state, and error
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  
  // Use refs for pending messages to avoid race conditions, when two or more threads can access shared data and they try to change it at the same time.
  // i.e pass the correct message to the correct thread.
  // useRef is a hook that returns a mutable ref object which allows enables a store of values that persists between renders of the component.
  // map is a collection of elements where each element is stored as a Key, value pair
  const pendingMessagesRef = useRef(new Map());

  // Use ref for messageId to ensure unique IDs across reconnections
  // initial value is 1, for the first ref after the connection is established.
  const messageIdRef = useRef(1);

  // function to clear pending websocket messages, reject all promises with an error
  const clearPendingMessages = (error) => {
    pendingMessagesRef.current.forEach(({ reject }) => {
      reject(error || new Error('Connection closed'));
    });
    pendingMessagesRef.current.clear();
  };

  // function to opem a connection to the Moonraker websocket
  const connect = useCallback(() => {
    try {
      // check if the website connection protocol is https, if it is, use wss for a secure websocket, if not, use ws
      // window.location.protocol is a property of the browser's window object that returns the web protocol of the current page.
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      // build the websocket url
      const wsUrl = `${protocol}//${window.location.host}/websocket`;

      // create a new websocket connection
      console.log('Connecting to Moonraker:', wsUrl);

      // WebSocekt is a built in class in the browser.
      // ws is a new instance of the WebSocket class, with the url of the Moonraker websocket
      const ws = new WebSocket(wsUrl);
      
      // set up built in event listeners for the websocket
      // browser automatically calls these functions when the event occurs
      // onopen is called when the connection is established
      ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
        setError(null);
      };

      // onmessage is called when a message is received from the server
      ws.onmessage = (event) => {
        //open a try block to catch any errors
        try {
          //parse the data from the event
          const data = JSON.parse(event.data);
          // Ignore proc_stat_update notifications - cpu statistics
          if (data.method === 'notify_proc_stat_update') {
            return; // return early
          }

          // implicit else
          // log the received data
          console.log('Received:', data);

          // Handle responses to our requests
          // JSON-RPC protocol websockets pass the id of the message back to us in the response
          // if the returned message contains an id, it is a response to a message we sent
          if (data.id) {
            // match the id of the received message to the id of a message that we sent.
            const pendingMessage = pendingMessagesRef.current.get(data.id);

            if (pendingMessage) {
              // if a match is found, get the promise resolve and reject handlers, and the timeout ID for this message
              const { resolve, reject, timeoutId } = pendingMessage;

              // Clear timeout since we got a response
              clearTimeout(timeoutId);
              
              if (data.error) {
                // if there is an error, reject the promise with the error message
                reject(new Error(data.error.message || 'Unknown error'));
              } else {
                // otherwise, resolve the promise with the result
                resolve(data.result);
              }
              
              // clear the message from the pending messages
              pendingMessagesRef.current.delete(data.id);
            }
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      // onclose is called when the connection is closed
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code);
        // set the socket
        setSocket(null);

        // clear pending messages with an error
        clearPendingMessages(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
        
        // Attempt to reconnect
        setTimeout(() => connect(), RECONNECT_DELAY);
      };

      // onerror is called when there is an error with the websocket
      // log the error
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError(err.message || 'Connection error');
      };

    // catch any errors that occur when trying to establish a connection
    } catch (e) {
      console.error('Failed to establish connection:', e);
      setError(e.message);
    }
  }, []);

  // function to send a message to the Moonraker websocket
  const sendMessage = useCallback((method, params = {}) => {
    // handle the case where the socket is not connected, raise an error
    // return a rejected promise with the error message
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    // return a new promise, to be filled by the response from the server using the resolve and reject handlers
    // Code in anonymous arrow function is executed immediately when the promise is created, for message response handling
    return new Promise((resolve, reject) => {
      const id = messageIdRef.current++;
      const message = {
        jsonrpc: "2.0",
        method,
        params,
        id
      };

      // Set up timeout for this message
      // setTimeout() is a built-in JavaScript function that allows you to schedule a function to be executed after a specified delay. 
      // built in webAPI in the browser
      const timeoutId = setTimeout(() => {
        if (pendingMessagesRef.current.has(id)) {
          // delete the message after the timeout has run out
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
        // send the message to the server
        socket.send(JSON.stringify(message));
        console.log('Sent:', message);
      } catch (err) {
        // if there is an error, clear the timeout, delete the message, and reject the promise with the error message
        clearTimeout(timeoutId);
        pendingMessagesRef.current.delete(id);
        reject(err);
      }
    });
  }, [socket]);

  // useEffect is a hook that runs when the component is mounted, and when the dependencies change
  // the code in the useEffect return statement is run when the component is unmounted
  useEffect(() => {
    // attempt to establish a connection to the Moonraker websocket
    connect();

    // return a cleanup function that closes the socket and clears pending messages
    return () => {
      if (socket) {
        socket.close();
        clearPendingMessages();
      }
    };
  }, []);

  // return the printer state, the send message function, and the socket to the caller of useMoonrakerSocket()
  return {
    sendMessage,
    socket,
    error
  };
};

