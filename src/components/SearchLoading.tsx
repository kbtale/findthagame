import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress } from './ui/progress';

const LOADING_KEYS = Array.from({ length: 20 }, (_, i) => `searchLoading.${i}`);

export const SearchLoading = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Progress animation - fills over ~15 seconds with easing
    const duration = 15000;
    const startTime = Date.now();
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      // Use easing function to slow down as it approaches 95%
      const rawProgress = elapsed / duration;
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3); // cubic ease-out
      const newProgress = Math.min(easedProgress * 95, 95); // Cap at 95% until complete
      setProgress(newProgress);
      
      if (newProgress < 95) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    requestAnimationFrame(animateProgress);
    
    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_KEYS.length);
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-full max-w-md space-y-6">
        <p className="text-lg font-base text-text animate-pulse min-h-[2rem]">
          {t(LOADING_KEYS[messageIndex])}
        </p>
        <Progress value={progress} />
      </div>
    </div>
  );
};
