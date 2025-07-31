// src/components/common/PerformanceMonitor.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Collapse, Chip, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SpeedIcon from '@mui/icons-material/Speed';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  fps: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  componentCount?: number;
}

// FIX: Define a more specific type for performance that includes the non-standard 'memory' property.
// This makes the code type-safe and removes the need for @ts-ignore.
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  componentCount = 0,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    fps: 60,
    memoryUsage: undefined,
  });

  // FPS calculation
  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const calculateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(calculateFPS);
    };

    animationId = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  // Memory usage monitoring (if available)
  useEffect(() => {
    if (!enabled) return;

    const updateMemoryUsage = () => {
      // FIX: Cast performance to our extended type to safely access the 'memory' property.
      const perf = performance as PerformanceWithMemory;
      if (perf.memory) {
        const memoryUsageMB = Math.round(perf.memory.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memoryUsage: memoryUsageMB }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  // Update component count
  useEffect(() => {
    setMetrics(prev => ({ ...prev, componentCount }));
  }, [componentCount]);

  // Measure render time
  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    
    // Use requestIdleCallback if available, otherwise setTimeout
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime: Math.round(renderTime) }));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(measureRenderTime);
    } else {
      setTimeout(measureRenderTime, 0);
    }
  }, [enabled, componentCount]); // Re-measure when component count changes

  const getPositionStyles = useCallback(() => {
    const base = { position: 'fixed' as const, zIndex: 9999 };
    
    switch (position) {
      case 'top-left':
        return { ...base, top: 16, left: 16 };
      case 'top-right':
        return { ...base, top: 16, right: 16 };
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...base, bottom: 16, right: 16 };
    }
  }, [position]);

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return theme.palette.success.main;
    if (fps >= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (!enabled) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        ...getPositionStyles(),
        minWidth: isOpen ? 250 : 150,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isOpen ? `1px solid ${theme.palette.divider}` : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon fontSize="small" />
          <Typography variant="caption" fontWeight="bold">
            Performance
          </Typography>
        </Box>
        <IconButton size="small">
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isOpen}>
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              FPS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {metrics.fps}
              </Typography>
              <Chip
                label={metrics.fps >= 55 ? 'Good' : metrics.fps >= 30 ? 'Fair' : 'Poor'}
                size="small"
                sx={{
                  backgroundColor: getFPSColor(metrics.fps),
                  color: theme.palette.getContrastText(getFPSColor(metrics.fps)),
                  height: 20,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Render Time
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {metrics.renderTime}ms
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Components
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {metrics.componentCount}
            </Typography>
          </Box>

          {metrics.memoryUsage !== undefined && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Memory Usage
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.memoryUsage}MB
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PerformanceMonitor;