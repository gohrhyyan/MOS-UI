import React, { useEffect } from 'react';

const ResponsiveContainer = ({ children, allowContentScroll = false }) => {
  useEffect(() => {
    const setVh = () => {
      // Use visualViewport if available, fallback to window.innerHeight
      const vh = (window.visualViewport?.height || window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial height
    setVh();

    // Update on resize and visualViewport changes
    window.addEventListener('resize', setVh);
    window.visualViewport?.addEventListener('resize', setVh);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      window.removeEventListener('resize', setVh);
      window.visualViewport?.removeEventListener('resize', setVh);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col px-4 sm:px-6 relative h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-[var(--background-color)]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className={`flex flex-col flex-1 ${allowContentScroll ? 'overflow-auto' : 'overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer;