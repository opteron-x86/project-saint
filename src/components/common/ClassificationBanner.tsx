// src/components/common/ClassificationBanner.tsx

import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export type ClassificationLevel = 'CUI' | 'CUI//SP-EXPT' | 'CUI//SP-PRVCY' | 'CUI//SP-PROPIN';

interface ClassificationBannerProps {
  /**
   * The classification level to display
   */
  level?: ClassificationLevel;
  
  /**
   * Additional text to display alongside the classification
   */
  additionalText?: string;
  
  /**
   * Whether this is a header (top) or footer (bottom) banner
   */
  position?: 'top' | 'bottom';
  
  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

const ClassificationBanner: React.FC<ClassificationBannerProps> = ({
  level = 'CUI',
  additionalText,
  position = 'top',
  sx,
}) => {
  const theme = useTheme();
  
  // CUI standard colors (green background, white text)
  const backgroundColor = '#2E7D32'; 
  const textColor = '#FFFFFF';
  
  const getBannerText = () => {
    let text = level;
    if (additionalText) {
      text += ` - ${additionalText}`;
    }
    return text;
  };
  
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor,
        color: textColor,
        py: 0.75,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: theme.zIndex.appBar + 1, 
        borderTop: position === 'bottom' ? `2px solid ${alpha(textColor, 0.3)}` : undefined,
        boxShadow: position === 'top' 
          ? `0 2px 4px ${alpha('#000000', 0.1)}`
          : `0 -2px 4px ${alpha('#000000', 0.1)}`,
        ...sx,
      }}
      role="banner"
      aria-label={`Classification banner: ${getBannerText()}`}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: '0.5px',
          textAlign: 'center',
          textTransform: 'uppercase',
          userSelect: 'none',
          '@media (max-width: 600px)': {
            fontSize: '0.75rem',
          },
        }}
      >
        {getBannerText()}
      </Typography>

    </Box>
  );
};

export default ClassificationBanner;