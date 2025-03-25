import React, { useEffect } from 'react';

const ResponsiveContainer = ({ children, allowContentScroll = false }) => {
  // This effect runs once when component mounts and sets the custom --vh variable
  // This addresses mobile browser viewport height issues
  useEffect(() => {
    // Calculate viewport height and set it as a CSS variable
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Call it initially
    setVh();

    // Add event listener to recalculate when window is resized
    window.addEventListener('resize', setVh);

    // Clean up event listener when component unmounts
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col px-4 sm:px-6 relative h-[calc(var(--vh,1vh)*100)] overflow-hidden">
      {/* We wrap the children in another div that can be scrollable or not based on the prop */}
      <div className={`flex flex-col flex-1 ${allowContentScroll ? 'overflow-auto' : 'overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer;