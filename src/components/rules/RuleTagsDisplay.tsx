// src/components/rules/RuleTagsDisplay.tsx

import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  Button,
  Stack,
  useTheme,
  Popover,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface RuleTagsDisplayProps {
  /**
   * List of tags to display
   */
  tags: string[];
  
  /**
   * Initial number of tags to show
   */
  initialVisibleCount?: number;
  
  /**
   * Optional label for the tags section
   */
  label?: string;
  
  /**
   * Color for the tags
   */
  chipColor?: 'primary' | 'secondary' | 'default' | 'info' | 'success' | 'warning' | 'error';
  
  /**
   * Variant for the chips
   */
  chipVariant?: 'filled' | 'outlined';
  
  /**
   * Whether chips should be clickable
   */
  clickable?: boolean;
  
  /**
   * Callback when a tag is clicked
   */
  onTagClick?: (tag: string) => void;
  
  /**
   * Size of the chips
   */
  size?: 'small' | 'medium';
}

/**
 * A component to display rule tags with show more/less functionality
 */
const RuleTagsDisplay: React.FC<RuleTagsDisplayProps> = ({
  tags,
  initialVisibleCount = 5,
  label,
  chipColor = 'default',
  chipVariant = 'filled',
  clickable = false,
  onTagClick,
  size = 'small',
}) => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  // If no tags, return nothing
  if (!tags || tags.length === 0) {
    return null;
  }
  
  // Determine which tags to show
  const visibleTags = showAll ? tags : tags.slice(0, initialVisibleCount);
  const hasMoreTags = tags.length > initialVisibleCount;
  
  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (clickable && onTagClick) {
      onTagClick(tag);
    }
  };
  
  // Handle show more/less button click
  const handleShowMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="600"
          display="block"
          gutterBottom
        >
          {label}
        </Typography>
      )}
      
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {visibleTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size={size}
            color={chipColor}
            variant={chipVariant}
            onClick={clickable ? () => handleTagClick(tag) : undefined}
            clickable={clickable}
            sx={{ mb: 0.5 }}
          />
        ))}
        
        {hasMoreTags && (
          <>
            <Chip
              label={`+${tags.length - initialVisibleCount}`}
              size={size}
              color="default"
              variant="outlined"
              onClick={handleShowMoreClick}
              clickable
              sx={{
                mb: 0.5,
                fontSize: size === 'small' ? '0.7rem' : '0.8rem',
                fontWeight: 500,
              }}
            />
            
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: {
                  p: 2,
                  maxWidth: 400,
                  maxHeight: 300,
                  overflow: 'auto',
                },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                All {label ? label.toLowerCase() : 'tags'} ({tags.length})
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size={size}
                    color={chipColor}
                    variant={chipVariant}
                    onClick={clickable ? () => handleTagClick(tag) : undefined}
                    clickable={clickable}
                  />
                ))}
              </Box>
            </Popover>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default RuleTagsDisplay;