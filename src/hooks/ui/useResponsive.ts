// src/hooks/ui/useResponsive.ts

import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Custom hook for responsive design breakpoints
 */
export const useResponsive = () => {
  const theme = useTheme();
  
  // Check different breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  
  // Combination breakpoints
  const isMobile = isXs;
  const isTablet = isSm || isMd;
  const isDesktop = isLg || isXl;
  
  // Down breakpoints (common use case)
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('lg'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('xl'));
  
  // Up breakpoints (common use case)
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Calculate common UI dimensions based on breakpoint
  const getSidebarWidth = () => {
    if (isXs) return '100%';
    if (isSm) return 320;
    return 360;
  };
  
  const getContentMaxWidth = () => {
    if (isXs) return '100%';
    if (isSm) return '100%';
    if (isMd) return 900;
    if (isLg) return 1200;
    return 1536;
  };
  
  const getColumnCount = () => {
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 3;
    return 4;
  };
  
  return {
    // Breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Combination breakpoints
    isMobile,
    isTablet,
    isDesktop,
    
    // Down breakpoints
    isSmDown,
    isMdDown,
    isLgDown,
    
    // Up breakpoints
    isSmUp,
    isMdUp,
    isLgUp,
    
    // Dimension helpers
    getSidebarWidth,
    getContentMaxWidth,
    getColumnCount,
  };
};

export default useResponsive;