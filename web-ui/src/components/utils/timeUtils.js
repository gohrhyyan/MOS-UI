export const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}Hr ${minutes}Min`;
    }
    return `${minutes}Min`;
  };
  
  export const calculateAdjustedTime = (baseTimeMs, sliderPosition) => {
    const multipliers = [2, 1.5, 1, 1/1.5, 0.5];
    return baseTimeMs * multipliers[sliderPosition];
  };