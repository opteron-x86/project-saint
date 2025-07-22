// src/components/common/LoadingIndicator.tsx

import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingIndicatorProps {
  /**
   * Optional loading message to display
   */
  message?: string;
  
  /**
   * Whether to show a full-page loading indicator
   */
  fullPage?: boolean;
  
  /**
   * Size of the loading indicator
   */
  size?: number;
}

/**
 * A reusable loading indicator component
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  fullPage = false,
  size = 40,
}) => {
  const theme = useTheme();
  
  // If fullPage is true, show a centered loading indicator that covers the entire viewport
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.modal + 1,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <CircularProgress size={size} />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Default inline loading indicator
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;