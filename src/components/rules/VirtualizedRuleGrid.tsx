// src/components/rules/VirtualizedRuleGrid.tsx
import React, { useMemo, useCallback, CSSProperties, memo, useRef, useEffect } from 'react';
import { VariableSizeGrid as Grid, GridChildComponentProps, GridOnScrollProps, GridOnItemsRenderedProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, useTheme, useMediaQuery, Typography, Paper } from '@mui/material';
import { RuleSummary } from '@/api/types';
import RuleCard from './RuleCard';
import { useVirtualScrollPerformance } from '@/hooks/ui/useVirtualScrollPerformance';
import PerformanceMonitor from '@/components/common/PerformanceMonitor';

interface VirtualizedRuleGridProps {
  rules: RuleSummary[];
  isBookmarked: (ruleId: string) => boolean;
  onRuleSelect: (rule: RuleSummary) => void;
  onBookmark: (ruleId: string) => void;
}

interface CellProps extends GridChildComponentProps {
  data: {
    rules: RuleSummary[];
    columnCount: number;
    isBookmarked: (ruleId: string) => boolean;
    onRuleSelect: (rule: RuleSummary) => void;
    onBookmark: (ruleId: string) => void;
  };
}

const CARD_HEIGHT = 400; // Match the height from RuleCard
const GAP_SIZE = 20; // Gap between cards
const MIN_CARD_WIDTH = 300; // Minimum card width

const Cell: React.FC<CellProps> = memo(({ columnIndex, rowIndex, style, data }) => {
  const { rules, columnCount, isBookmarked, onRuleSelect, onBookmark } = data;
  const index = rowIndex * columnCount + columnIndex;
  
  if (index >= rules.length) {
    return null;
  }
  
  const rule = rules[index];
  
  // Adjust style to account for gaps
  const adjustedStyle: CSSProperties = {
    ...style,
    left: Number(style.left) + GAP_SIZE / 2,
    top: Number(style.top) + GAP_SIZE / 2,
    width: Number(style.width) - GAP_SIZE,
    height: Number(style.height) - GAP_SIZE,
  };
  
  return (
    <div style={adjustedStyle}>
      <RuleCard
        rule={rule}
        isBookmarked={isBookmarked(rule.id)}
        onClick={onRuleSelect}
        onBookmark={onBookmark}
      />
    </div>
  );
});

Cell.displayName = 'VirtualizedRuleGridCell';

const VirtualizedRuleGrid: React.FC<VirtualizedRuleGridProps> = ({
  rules,
  isBookmarked,
  onRuleSelect,
  onBookmark,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const gridRef = useRef<Grid>(null);
  
  // Performance monitoring
  const [visibleRange, setVisibleRange] = React.useState({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });
  
  const visibleItemCount = useMemo(() => {
    const { startRow, endRow, startColumn, endColumn } = visibleRange;
    return (endRow - startRow + 1) * (endColumn - startColumn + 1);
  }, [visibleRange]);
  
  const { metrics, handleScroll, getPerformanceReport } = useVirtualScrollPerformance({
    totalItems: rules.length,
    visibleItems: visibleItemCount,
    overscanCount: 2,
    enabled: process.env.NODE_ENV === 'development',
  });
  
  // Calculate column count based on screen size
  const getColumnCount = useCallback((width: number): number => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    
    // For larger screens, calculate based on available width
    const availableWidth = width - GAP_SIZE;
    const cardWidthWithGap = MIN_CARD_WIDTH + GAP_SIZE;
    return Math.max(1, Math.floor(availableWidth / cardWidthWithGap));
  }, [isMobile, isTablet]);
  
  // Calculate row count
  const getRowCount = useCallback((columnCount: number): number => {
    return Math.ceil(rules.length / columnCount);
  }, [rules.length]);
  
  // Get column width
  const getColumnWidth = useCallback((index: number, width: number, columnCount: number): number => {
    const availableWidth = width - GAP_SIZE;
    return Math.floor(availableWidth / columnCount);
  }, []);
  
  // Get row height (constant for cards)
  const getRowHeight = useCallback((): number => {
    return CARD_HEIGHT + GAP_SIZE;
  }, []);
  
  // FIX: Separate scroll handling from item rendering logic
  const handleGridScroll = useCallback((props: GridOnScrollProps) => {
    handleScroll(props.scrollTop);
  }, [handleScroll]);

  const handleItemsRendered = useCallback(({
    visibleRowStartIndex,
    visibleRowStopIndex,
    visibleColumnStartIndex,
    visibleColumnStopIndex
  }: GridOnItemsRenderedProps) => {
    setVisibleRange({
      startRow: visibleRowStartIndex,
      endRow: visibleRowStopIndex,
      startColumn: visibleColumnStartIndex,
      endColumn: visibleColumnStopIndex,
    });
  }, []);
  
  // Memoize the data object to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    rules,
    columnCount: 1, // Will be updated in AutoSizer
    isBookmarked,
    onRuleSelect,
    onBookmark,
  }), [rules, isBookmarked, onRuleSelect, onBookmark]);
  
  // Scroll to top when rules change significantly
  useEffect(() => {
    if (gridRef.current && rules.length > 0) {
      gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: 0 });
    }
  }, [rules.length]);
  
  return (
    <Box sx={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = getColumnCount(width);
          const rowCount = getRowCount(columnCount);
          
          // Update itemData with correct column count
          const dataWithColumnCount = {
            ...itemData,
            columnCount,
          };
          
          return (
            <>
              <Grid
                ref={gridRef}
                columnCount={columnCount}
                columnWidth={(index) => getColumnWidth(index, width, columnCount)}
                height={height}
                rowCount={rowCount}
                rowHeight={getRowHeight}
                width={width}
                itemData={dataWithColumnCount}
                overscanRowCount={2}
                overscanColumnCount={1}
                onScroll={handleGridScroll}
                onItemsRendered={handleItemsRendered}
              >
                {Cell}
              </Grid>
              
              {/* Performance monitoring overlay (development only) */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <PerformanceMonitor 
                    componentCount={visibleItemCount}
                    position="bottom-left"
                  />
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      p: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      fontSize: '0.75rem',
                      zIndex: 10,
                    }}
                  >
                    <Typography variant="caption" component="div">
                      {getPerformanceReport()}
                    </Typography>
                    <Typography variant="caption" component="div">
                      Scroll: {metrics.scrollDirection} @ {metrics.scrollVelocity}px/s
                    </Typography>
                  </Paper>
                </>
              )}
            </>
          );
        }}
      </AutoSizer>
    </Box>
  );
};

export default VirtualizedRuleGrid;