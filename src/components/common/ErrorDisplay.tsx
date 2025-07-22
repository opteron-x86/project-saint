// src/components/common/ErrorDisplay.tsx

import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorDisplayProps {
  /**
   * Error message to display
   */
  message?: string;
  
  /**
   * Optional error details for developers
   */
  details?: string;
  
  /**
   * Whether to show a retry button
   */
  retry?: boolean;
  
  /**
   * Function to call when retry button is clicked
   */
  onRetry?: () => void;
}

/**
 * A reusable error display component
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'An error occurred',
  details,
  retry = true,
  onRetry,
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: 'error.lighter',
        border: `1px solid ${theme.palette.error.light}`,
      }}
    >
      <ErrorOutlineIcon
        color="error"
        sx={{ fontSize: 48, mb: 2 }}
      />
      
      <Typography
        variant="h6"
        color="error"
        gutterBottom
      >
        {message}
      </Typography>
      
      {details && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            maxWidth: '100%',
            overflow: 'auto',
            fontFamily: 'monospace',
          }}
        >
          {details}
        </Typography>
      )}
      
      {retry && onRetry && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Paper>
  );
};

export default ErrorDisplay;