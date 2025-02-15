// src/hooks/usePrintProgress.js
import { useState, useEffect, useRef } from 'react';

export const usePrintProgress = ({ isPaused, setIsPaused, setPrintStatus }) => {
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const progressInterval = useRef(null);
  const estimatedDuration = 25000; // 25 seconds for demo

  useEffect(() => {
    if (!isPaused) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      if (!startTime) {
        setStartTime(Date.now() - elapsedTime);
      }

      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setElapsedTime(elapsed);
        const currentProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(progressInterval.current);
        }
      }, 100);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPaused, startTime, estimatedDuration, elapsedTime]);

  const handlePauseResume = () => {
    setIsPaused(prevPaused => {
      if (!prevPaused) {
        setElapsedTime(Date.now() - startTime);
      } else {
        setStartTime(Date.now() - elapsedTime);
      }
      
      setPrintStatus(!prevPaused ? 'pausing' : 'resuming');
      setTimeout(() => {
        setPrintStatus(!prevPaused ? 'paused' : 'printing');
      }, 1000);
      
      return !prevPaused;
    });
  };

  return {
    progress,
    startTime,
    handlePauseResume
  };
};