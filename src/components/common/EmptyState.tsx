// src/components/common/EmptyState.tsx

import React, { ReactNode } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface EmptyStateProps {
  /**
   * Title to display
   */
  title?: string;
  
  /**
   * Description message
   */
  description?: string;
  
  /**
   * Custom icon to display
   */
  icon?: ReactNode;
  
  /**
   * Action button text
   */
  actionText?: string;
  
  /**
   * Callback for action button
   */
  onAction?: () => void;
  
  /**
   * Type of empty state
   */
  type?: 'noResults' | 'noData' | 'custom';
  
  /**
   * Height of the empty state container
   */
  height?: string | number;
}

/**
 * A reusable empty state component
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  type = 'noResults',
  height = 300,
}) => {
  const theme = useTheme();
  
  // Default content based on type
  let defaultTitle = '';
  let defaultDescription = '';
  let defaultIcon: ReactNode = null;
  let defaultActionText = '';
  
  switch (type) {
    case 'noResults':
      defaultTitle = 'No results found';
      defaultDescription = 'Try adjusting your filters or search terms.';
      defaultIcon = <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      defaultActionText = 'Clear filters';
      break;
    case 'noData':
      defaultTitle = 'No data available';
      defaultDescription = 'There are no items to display yet.';
      defaultIcon = <AddCircleOutlineIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      defaultActionText = 'Add new';
      break;
    default:
      break;
  }
  
  // Use provided props or defaults
  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  const displayIcon = icon || defaultIcon;
  const displayActionText = actionText || defaultActionText;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        p: 3,
        textAlign: 'center',
      }}
    >
      {displayIcon && (
        <Box sx={{ mb: 2, opacity: 0.8 }}>
          {displayIcon}
        </Box>
      )}
      
      {displayTitle && (
        <Typography
          variant="h6"
          color="text.primary"
          gutterBottom
        >
          {displayTitle}
        </Typography>
      )}
      
      {displayDescription && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: 3 }}
        >
          {displayDescription}
        </Typography>
      )}
      
      {displayActionText && onAction && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onAction}
        >
          {displayActionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;