import React from 'react';

const ResponsiveContainer = ({ children }) => (
  <div className="w-full max-w-md mx-auto flex flex-col px-4 sm:px-6 py-4 bg-white relative h-[calc(var(--vh,1vh)*70)]">
    {children}
  </div>
);

export default ResponsiveContainer;