import React, { memo } from 'react';
import { Box, Typography, Button, Skeleton, useTheme } from '@mui/material';
import { formatNumber } from '../../utils/format';

interface RuleStatusBarProps {
  /**
   * Current number of rules displayed
   */
  displayedCount: number;
  
  /**
   * Total number of rules in the database
   */
  totalCount: number;
  
  /**
   * Whether filters are currently active
   */
  hasActiveFilters: boolean;
  
  /**
   * Whether data is currently loading
   */
  isLoading: boolean;
  
  /**
   * Callback to clear all filters
   */
  onClearFilters: () => void;
}

/**
 * Component to display rules count and filter status
 */
const RuleStatusBar = memo(({
  displayedCount,
  totalCount,
  hasActiveFilters,
  isLoading,
  onClearFilters,
}: RuleStatusBarProps) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        py: 1,
      }}
    >
      {isLoading ? (
        <Skeleton width={200} height={24} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {displayedCount > 0 ? (
            `Showing ${formatNumber(displayedCount)} of ${formatNumber(totalCount)} rules`
          ) : (
            hasActiveFilters ? 'No rules match the current filters' : 'No rules available'
          )}
        </Typography>
      )}
      
      {hasActiveFilters && (
        <Button
          size="small"
          color="primary"
          onClick={onClearFilters}
          disabled={isLoading}
        >
          Clear All Filters
        </Button>
      )}
    </Box>
  );
});

RuleStatusBar.displayName = 'RuleStatusBar';

export default RuleStatusBar;