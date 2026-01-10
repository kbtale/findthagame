import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

const LOADING_MESSAGES = [
  "Scanning the multiverse for your game...",
  "Asking NPCs if they've seen it...",
  "Checking behind the couch cushions...",
  "Loading... please insert coin to continue",
  "Consulting the ancient game scrolls...",
  "Bribing the database elves...",
  "Rolling a D20 for search results...",
  "Speedrunning this query...",
  "Unlocking the secret level...",
  "Warming up the flux capacitor...",
  "Downloading more RAM...",
  "Teaching AI to appreciate good games...",
  "Defeating the final boss of lag...",
  "Parsing pixels with passion...",
  "Respawning search results...",
  "Achievement unlocked: Patience!",
  "Buffering... like it's 2005 again",
  "Convincing electrons to move faster...",
  "Assembling the Avengers of gaming...",
  "Almost there... just one more loading screen...",
];

export const SearchLoading = () => {
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
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-full max-w-md space-y-6">
        <p className="text-lg font-base text-text animate-pulse min-h-[2rem]">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <Progress value={progress} />
      </div>
    </div>
  );
};
