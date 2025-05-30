import { useEffect, useRef, useState } from "react";

interface SwipeOptions {
  threshold?: number; // Minimum distance required for swipe (px)
  timeout?: number;   // Maximum time allowed for swipe (ms)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipe({
  threshold = 50,
  timeout = 300,
  onSwipeLeft,
  onSwipeRight,
}: SwipeOptions) {
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startXRef.current = e.touches[0].clientX;
        startTimeRef.current = Date.now();
        setIsSwiping(true);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while swiping
      if (isSwiping && e.touches.length === 1) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (
        isSwiping &&
        startXRef.current !== null &&
        startTimeRef.current !== null
      ) {
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startXRef.current;
        const timeDiff = Date.now() - startTimeRef.current;
        
        if (timeDiff <= timeout) {
          if (diffX > threshold && onSwipeRight) {
            onSwipeRight();
          } else if (diffX < -threshold && onSwipeLeft) {
            onSwipeLeft();
          }
        }
        
        startXRef.current = null;
        startTimeRef.current = null;
        setIsSwiping(false);
      }
    };
    
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isSwiping, onSwipeLeft, onSwipeRight, threshold, timeout]);
  
  return { isSwiping };
}
