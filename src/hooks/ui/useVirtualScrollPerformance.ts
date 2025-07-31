// src/hooks/ui/useVirtualScrollPerformance.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualScrollMetrics {
  visibleItems: number;
  totalItems: number;
  scrollFPS: number;
  overscan: number;
  scrollDirection: 'up' | 'down' | 'idle';
  scrollVelocity: number;
  renderEfficiency: number; // Percentage of items that are actually visible
}

interface UseVirtualScrollPerformanceProps {
  totalItems: number;
  visibleItems: number;
  overscanCount?: number;
  enabled?: boolean;
}

export const useVirtualScrollPerformance = ({
  totalItems,
  visibleItems,
  overscanCount = 0,
  enabled = process.env.NODE_ENV === 'development',
}: UseVirtualScrollPerformanceProps) => {
  const [metrics, setMetrics] = useState<VirtualScrollMetrics>({
    visibleItems,
    totalItems,
    scrollFPS: 60,
    overscan: overscanCount,
    scrollDirection: 'idle',
    scrollVelocity: 0,
    renderEfficiency: 100,
  });

  const scrollPositionRef = useRef(0);
  const lastScrollTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<number | null>(null);

  // Calculate render efficiency
  useEffect(() => {
    if (!enabled) return;

    const efficiency = totalItems > 0 
      ? Math.round((visibleItems / totalItems) * 100)
      : 100;

    setMetrics(prev => ({
      ...prev,
      visibleItems,
      totalItems,
      overscan: overscanCount,
      renderEfficiency: efficiency,
    }));
  }, [visibleItems, totalItems, overscanCount, enabled]);

  // Track scroll performance
  const handleScroll = useCallback((scrollTop: number) => {
    if (!enabled) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastScrollTimeRef.current;
    const deltaScroll = scrollTop - scrollPositionRef.current;

    // Calculate scroll velocity (pixels per second)
    const velocity = deltaTime > 0 ? Math.abs(deltaScroll / deltaTime * 1000) : 0;

    // Determine scroll direction
    const direction = deltaScroll > 0 ? 'down' : deltaScroll < 0 ? 'up' : 'idle';

    setMetrics(prev => ({
      ...prev,
      scrollDirection: direction,
      scrollVelocity: Math.round(velocity),
    }));

    scrollPositionRef.current = scrollTop;
    lastScrollTimeRef.current = currentTime;
  }, [enabled]);

  // Monitor scroll FPS
  useEffect(() => {
    if (!enabled) return;

    let lastTime = performance.now();
    frameCountRef.current = 0;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          scrollFPS: fps,
        }));

        frameCountRef.current = 0;
        lastTime = currentTime;
      }
    };

    // Start monitoring
    const startMonitoring = () => {
      if (fpsIntervalRef.current) {
        cancelAnimationFrame(fpsIntervalRef.current);
      }
      
      const animate = () => {
        measureFPS();
        fpsIntervalRef.current = requestAnimationFrame(animate);
      };
      
      fpsIntervalRef.current = requestAnimationFrame(animate);
    };

    startMonitoring();

    return () => {
      if (fpsIntervalRef.current) {
        cancelAnimationFrame(fpsIntervalRef.current);
      }
    };
  }, [enabled]);

  const getPerformanceReport = useCallback((): string => {
    const { renderEfficiency, scrollFPS, totalItems, visibleItems } = metrics;
    
    const performanceScore = (renderEfficiency < 10 && scrollFPS > 30) ? 'Excellent' :
                            (renderEfficiency < 20 && scrollFPS > 24) ? 'Good' :
                            (renderEfficiency < 50 && scrollFPS > 20) ? 'Fair' : 'Poor';

    return `Performance: ${performanceScore} | Rendering ${visibleItems} of ${totalItems} items (${renderEfficiency}% efficiency) at ${scrollFPS} FPS`;
  }, [metrics]);

  return {
    metrics,
    handleScroll,
    getPerformanceReport,
  };
};

export default useVirtualScrollPerformance;