// src/pages/RulesExplorer/RulesExplorer.tsx

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  useTheme,
  useMediaQuery,
  Stack,
  Paper,
  Select,
  SelectChangeEvent,
  Divider,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// API and Types
import { RuleSummary } from '@/api/types';

// Components
import { LoadingIndicator, ErrorDisplay, EmptyState } from '@/components/common';
import { RuleFilterBar } from '@/components/rules';
import RulesTable from '@/components/rules/RulesTable';
import VirtualizedRuleGrid from '@/components/rules/VirtualizedRuleGrid';

// Hooks and Utils
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useRuleBookmarks from '@/hooks/data/useRuleBookmarks';
import { useRuleStore } from '@/store';
import { useRuleQuery } from '@/api/queries';
import { formatDate } from '@/utils/format';

// Lazy Components
const LazyRuleDetail = lazy(() => import('@/components/rules/RuleDetail'));

const HEADER_HEIGHT = 96;

type ViewMode = 'table' | 'grid';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRules: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRules,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRules);
  
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        px: 2,
        py: 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        backgroundColor: alpha(theme.palette.background.default, 0.4),
      }}
    >
      {/* Results info */}
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {totalRules > 0 ? `${startIndex}–${endIndex} of ${totalRules}` : 'No results'}
      </Typography>
      
      <Box sx={{ flex: 1 }} />
      
      {/* Page size selector */}
      {!isMobile && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <Select
            value={pageSize}
            onChange={(e: SelectChangeEvent<number>) => onPageSizeChange(Number(e.target.value))}
            size="small"
            disabled={disabled}
            sx={{
              minWidth: 70,
              '& .MuiSelect-select': { py: 0.5 },
            }}
          >
            {[10, 25, 50, 100].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      )}
      
      {/* Page navigation */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
        >
          <NavigateBeforeIcon fontSize="small" />
        </IconButton>
        
        <Typography variant="body2" sx={{ mx: 1, minWidth: 60, textAlign: 'center' }}>
          {currentPage} / {totalPages || 1}
        </Typography>
        
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
        >
          <NavigateNextIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage >= totalPages}
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const RulesExplorer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Store hooks
  const { selectRule: setSelectedRuleInStore } = useRuleStore();

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedRuleIdForDetail, setSelectedRuleIdForDetail] = useState<string | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

  // Handle opening rule detail from navigation state
  useEffect(() => {
    const ruleIdToOpen = location.state?.openRuleId;
    if (ruleIdToOpen) {
      setSelectedRuleIdForDetail(ruleIdToOpen);
      setDetailDrawerOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Main data hook
  const {
    rules: fetchedRules,
    totalRules,
    currentPage,
    pageSize,
    totalPages,
    sortModel,
    hasActiveFilters,
    isLoading,
    isFetching,
    isError,
    error,
    handlePageChange,
    handleSortChange,
    refetch,
    resetFiltersAndPage,
  } = usePaginatedRules();

  // Rule detail query
  const {
    data: selectedRuleFullDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
  } = useRuleQuery(selectedRuleIdForDetail);

  // Bookmarks functionality
  const { bookmarkedRules, toggleBookmark, isBookmarked } = useRuleBookmarks();

  // Computed values
  const rulesToDisplay = useMemo(() => {
    if (showBookmarkedOnly) {
      return fetchedRules.filter(rule => bookmarkedRules.has(rule.id));
    }
    return fetchedRules;
  }, [fetchedRules, showBookmarkedOnly, bookmarkedRules]);

  const effectiveIsLoading = isLoading || isFetching;

  // Event handlers
  const handleRuleSelect = useCallback((ruleSummary: RuleSummary) => {
    setSelectedRuleInStore(ruleSummary);
    setSelectedRuleIdForDetail(ruleSummary.id);
    setDetailDrawerOpen(true);
  }, [setSelectedRuleInStore]);

  const handleCloseDetail = useCallback(() => {
    setDetailDrawerOpen(false);
    setTimeout(() => {
      setSelectedRuleIdForDetail(null);
      setSelectedRuleInStore(null);
    }, 300);
  }, [setSelectedRuleInStore]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleToggleShowBookmarked = useCallback(() => {
    setShowBookmarkedOnly(prev => !prev);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    handlePageChange(1, newPageSize);
  }, [handlePageChange]);

  const handleExportRules = useCallback(() => {
    setMoreMenuAnchor(null);
    
    // For bookmarked rules, export locally instead of using API
    const rulesForExport = showBookmarkedOnly ? rulesToDisplay : fetchedRules;
    if (!rulesForExport || rulesForExport.length === 0) {
      alert('No rules to export.');
      return;
    }

    // Client-side CSV export
    const csvContent = [
      ['ID', 'Title', 'Description', 'Status', 'Source', 'Platforms', 'MITRE Techniques', 'Created', 'Modified'].join(','),
      ...rulesForExport.map(rule => [
        rule.id,
        `"${(rule.title || '').replace(/"/g, '""')}"`,
        `"${(rule.description || '').replace(/"/g, '""')}"`,
        rule.status ?? 'unknown',
        rule.rule_source,
        `"${(rule.rule_platforms ?? []).join('; ')}"`,
        `"${(rule.linked_technique_ids ?? []).join('; ')}"`,
        rule.created_date ? formatDate(rule.created_date) : '-',
        rule.modified_date ? formatDate(rule.modified_date) : '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rules_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [showBookmarkedOnly, rulesToDisplay, fetchedRules]);

  const handleViewModeChange = useCallback((_: React.MouseEvent<HTMLElement>, value: ViewMode | null) => {
    if (value) setViewMode(value);
  }, []);

  const handleSortModelChange = useCallback((model: any) => {
    handleSortChange(model);
  }, [handleSortChange]);

  const handlePaginationChange = useCallback((page: number, newPageSize?: number) => {
    handlePageChange(page + 1, newPageSize);
  }, [handlePageChange]);

  // Render content
  const renderContent = () => {
    if (isError && error) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorDisplay
            message={error.message || "Failed to load rules. Please try again."}
            details={import.meta.env.DEV ? error.stack : undefined}
            onRetry={refetch}
          />
        </Box>
      );
    }

    if (!effectiveIsLoading && rulesToDisplay.length === 0) {
      const message = showBookmarkedOnly 
        ? "No bookmarked rules found. Bookmark some rules to see them here."
        : hasActiveFilters 
        ? "No rules match your current filters. Try adjusting your search criteria."
        : "No rules available in the system.";

      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            title="No Rules Found"
            description={message}
            actionText={(showBookmarkedOnly || hasActiveFilters) ? "Clear Filters" : undefined}
            onAction={(showBookmarkedOnly || hasActiveFilters) ? () => {
              resetFiltersAndPage();
              setShowBookmarkedOnly(false);
            } : undefined}
          />
        </Box>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <VirtualizedRuleGrid
            rules={rulesToDisplay}
            isBookmarked={isBookmarked}
            onRuleSelect={handleRuleSelect}
            onBookmark={toggleBookmark}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <RulesTable
          rules={rulesToDisplay}
          bookmarkedRuleIds={bookmarkedRules}
          isLoading={effectiveIsLoading}
          totalRules={totalRules}
          currentPage={currentPage - 1}
          pageSize={pageSize}
          sortModel={sortModel}
          onRuleSelect={handleRuleSelect}
          onBookmark={toggleBookmark}
          onSortChange={handleSortModelChange}
          onPaginationChange={handlePaginationChange}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Integrated Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <RuleFilterBar />
        
        {/* Secondary Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          {/* Left section - Bookmarks */}
          <ToggleButton
            value="bookmarks"
            selected={showBookmarkedOnly}
            onChange={handleToggleShowBookmarked}
            size="small"
            sx={{
              px: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {showBookmarkedOnly ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {showBookmarkedOnly ? 'Bookmarked' : 'Bookmarks'}
                {bookmarkedRules.size > 0 && ` (${bookmarkedRules.size})`}
              </Typography>
            )}
          </ToggleButton>

          {/* Right section - View controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* View mode toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="table">
                <Tooltip title="Table view">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid">
                <Tooltip title="Grid view">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem />

            {/* Refresh */}
            <IconButton
              onClick={handleRefresh}
              disabled={effectiveIsLoading}
              size="small"
            >
              <RefreshIcon />
            </IconButton>

            {/* More menu */}
            <IconButton
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={() => setMoreMenuAnchor(null)}
            >
              <MenuItem onClick={handleExportRules}>
                <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                Export CSV
              </MenuItem>
              <MenuItem component={RouterLink} to="/insights" onClick={() => setMoreMenuAnchor(null)}>
                <InsightsIcon fontSize="small" sx={{ mr: 1 }} />
                View Insights
              </MenuItem>
              <MenuItem component={RouterLink} to="/attack-matrix" onClick={() => setMoreMenuAnchor(null)}>
                <SecurityIcon fontSize="small" sx={{ mr: 1 }} />
                MITRE ATT&CK Matrix
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && !showBookmarkedOnly && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRules={totalRules}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disabled={effectiveIsLoading}
        />
      )}

      {/* Rule Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={handleCloseDetail}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : '60%',
            maxWidth: '800px',
            minWidth: '400px',
            top: HEADER_HEIGHT,
            height: `calc(100% - ${HEADER_HEIGHT}px)`,
            position: 'fixed',
          },
        }}
      >
        <Suspense fallback={
          <Box sx={{ p: 3 }}>
            <LoadingIndicator />
          </Box>
        }>
          {selectedRuleIdForDetail && selectedRuleFullDetail && (
            <LazyRuleDetail
              rule={selectedRuleFullDetail}
              onClose={handleCloseDetail}
              isLoading={isLoadingDetail}
              isError={isErrorDetail}
              error={errorDetail}
              isBookmarked={isBookmarked(selectedRuleIdForDetail)}
              onBookmark={toggleBookmark}
            />
          )}
        </Suspense>
      </Drawer>
    </Box>
  );
};

export default RulesExplorer;