// src/components/common/FilterChip.tsx

import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';

interface FilterChipProps extends Omit<ChipProps, 'onDelete'> {
  /**
   * The label to display for the filter
   */
  label: string;
  
  /**
   * The type/category of the filter (e.g., 'severity', 'platform')
   */
  category?: string;
  
  /**
   * Whether the filter is clearable
   */
  clearable?: boolean;
  
  /**
   * Callback when the filter is cleared
   */
  onClear?: () => void;
  
  /**
   * Custom color for the chip
   */
  customColor?: string;
}

/**
 * A reusable chip component for displaying active filters
 */
const FilterChip: React.FC<FilterChipProps> = ({
  label,
  category,
  clearable = true,
  onClear,
  customColor,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  
  // Prepare the display label
  const displayLabel = category ? `${category}: ${label}` : label;
  
  return (
    <Chip
      label={displayLabel}
      size="small"
      onDelete={clearable ? onClear : undefined}
      sx={{
        m: 0.5,
        backgroundColor: customColor || theme.palette.primary.light,
        color: customColor ? '#fff' : theme.palette.primary.contrastText,
        fontWeight: 500,
        '& .MuiChip-deleteIcon': {
          color: customColor ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
          '&:hover': {
            color: customColor ? '#fff' : 'inherit',
          },
        },
        ...sx,
      }}
      {...rest}
    />
  );
};

export default FilterChip;