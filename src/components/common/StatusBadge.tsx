// src/components/common/StatusBadge.tsx

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface StatusBadgeProps {
  /**
   * Label text to display
   */
  label: string;
  
  /**
   * Status severity/color
   */
  status?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'critical' | 'high' | 'medium' | 'low' | string;
  
  /**
   * Size of the badge
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to show the dot indicator
   */
  showDot?: boolean;
}

/**
 * A reusable status badge component
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status = 'default',
  size = 'medium',
  showDot = true,
}) => {
  const theme = useTheme();
  
  // Determine background and text colors based on status
  let backgroundColor = theme.palette.grey[200];
  let textColor = theme.palette.grey[700];
  let dotColor = theme.palette.grey[500];
  
  // A helper function to safely access palette colors
  const getStatusColors = (colorKey: 'success' | 'warning' | 'error' | 'info' | 'critical' | 'high' | 'medium' | 'low') => {
    const palette = theme.palette as any; // Use any to access custom keys
    if (palette[colorKey]) {
      return {
        bg: palette[colorKey].light,
        text: palette[colorKey].dark,
        dot: palette[colorKey].main
      };
    }
    return null;
  };

  const colors = getStatusColors(status as any);

  if (colors) {
    backgroundColor = colors.bg;
    textColor = colors.text;
    dotColor = colors.dot;
  } else { // Fallback for default or unknown statuses
      switch (status) {
        case 'high':
          backgroundColor = '#FFEDD5'; // Light orange
          textColor = '#C2410C'; // Dark orange
          dotColor = '#EA580C'; // Orange
          break;
        case 'medium':
          backgroundColor = '#FEF3C7'; // Light amber
          textColor = '#B45309'; // Dark amber
          dotColor = '#D97706'; // Amber
          break;
        case 'low':
          backgroundColor = '#ECFCCB'; // Light lime
          textColor = '#4D7C0F'; // Dark lime
          dotColor = '#65A30D'; // Lime
          break;
        default:
          backgroundColor = theme.palette.grey[200];
          textColor = theme.palette.grey[700];
          dotColor = theme.palette.grey[500];
          break;
      }
  }

  // Determine size based on prop
  let paddingY = 0.5;
  let paddingX = 1;
  let fontSize = 12;
  let dotSize = 6;
  
  switch (size) {
    case 'small':
      paddingY = 0.25;
      paddingX = 0.75;
      fontSize = 11;
      dotSize = 5;
      break;
    case 'large':
      paddingY = 0.75;
      paddingX = 1.5;
      fontSize = 14;
      dotSize = 8;
      break;
    default:
      break;
  }
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        py: paddingY,
        px: paddingX,
        borderRadius: '16px',
        backgroundColor,
      }}
    >
      {showDot && (
        <Box
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: dotColor,
            mr: 0.75,
          }}
        />
      )}
      <Typography
        variant="caption"
        sx={{
          color: textColor,
          fontWeight: 600,
          fontSize,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default StatusBadge;