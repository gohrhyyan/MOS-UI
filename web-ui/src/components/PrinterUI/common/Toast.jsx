import React from 'react';

// Simplified Toast component that shows when message is truthy
// message: string | null - The message to display. If null/empty, toast is hidden
const Toast = ({ message }) => (
  <div 
    className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 
      bg-gray-800 text-white px-4 py-2 rounded-lg
      transition-opacity duration-300 
      ${message ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}
  >
    {message}
  </div>
);

export default Toast;