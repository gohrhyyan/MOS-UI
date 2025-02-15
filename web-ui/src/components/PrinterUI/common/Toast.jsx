import React from 'react';

const Toast = ({ show, message }) => (
  <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 
    bg-gray-800 text-white px-4 py-2 rounded-lg
    transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
    {message}
  </div>
);

export default Toast;
