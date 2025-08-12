// src/pages/RulesExplorer/RulesExplorer.tsx

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  useTheme,
  useMediaQuery,
  Chip,
  Pagination,
  FormControlLabel,
  Switch,
  Alert,
  Stack,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';

// API and Types
import { RuleSummary, RuleSeverity } from '@/api/types';
import { useExportRulesMutation } from '@/api/queries';

// Components
import { LoadingIndicator, ErrorDisplay, EmptyState, StatusBadge } from '@/components/common';
import { RuleFilterBar, RuleStatusBar } from '@/components/rules';
import RulesTable from '@/components/rules/RulesTable';
import VirtualizedRuleGrid from '@/components/rules/VirtualizedRuleGrid';
import { SkeletonGrid } from '@/components/rules/RuleCardSkeleton';

// Hooks and Utils
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useRuleBookmarks from '@/hooks/data/useRuleBookmarks';
import { useRuleStore } from '@/store';
import { useRuleQuery } from '@/api/queries';
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';
import { formatDate } from '@/utils/format';

import { ApiError } from '@/api/types';

// Lazy Components
const LazyRuleDetail = lazy(() => import('@/components/rules/RuleDetail'));
const LazyRuleCard = lazy(() => import('@/components/rules/RuleCard'));

type ViewMode = 'table' | 'grid';

const RulesExplorer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Store hooks
  const { selectedRule, selectRule: setSelectedRuleInStore } = useRuleStore();

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedRuleIdForDetail, setSelectedRuleIdForDetail] = useState<string | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  // Handle opening rule detail from navigation state
  useEffect(() => {
    const ruleIdToOpen = location.state?.openRuleId;
    if (ruleIdToOpen) {
      setSelectedRuleIdForDetail(ruleIdToOpen);
      setDetailDrawerOpen(true);
      // Clear the state to prevent the drawer from re-opening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Main data hook - enhanced with better error handling
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
    facets,
    debugInfo,
  } = usePaginatedRules();

  // Rule detail query
  const {
    data: selectedRuleFullDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
    refetch: refetchDetail,
  } = useRuleQuery(selectedRuleIdForDetail);

  // Bookmarks functionality
  const { bookmarkedRules, toggleBookmark, isBookmarked } = useRuleBookmarks();

  // Export mutation
  const exportMutation = useExportRulesMutation();

  // Computed values
  const rulesToDisplay = useMemo(() => {
    if (showBookmarkedOnly) {
      return fetchedRules.filter(rule => bookmarkedRules.has(rule.id));
    }
    return fetchedRules;
  }, [fetchedRules, showBookmarkedOnly, bookmarkedRules]);

  const currentDisplayedCount = rulesToDisplay.length;
  const currentTotalCountForStatus = showBookmarkedOnly ? bookmarkedRules.size : totalRules;
  const effectiveIsLoading = isLoading || isFetching;

  // Event handlers
  const handleRuleSelect = useCallback((ruleSummary: RuleSummary) => {
    console.log('RulesExplorer: Rule selected:', ruleSummary.id);
    setSelectedRuleIdForDetail(ruleSummary.id);
    setDetailDrawerOpen(true);
  }, []);

  const handleToggleShowBookmarked = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShowBookmarkedOnly(event.target.checked);
  }, []);

  // Update global store when rule detail is loaded
  useEffect(() => {
    if (selectedRuleFullDetail) {
      setSelectedRuleInStore(selectedRuleFullDetail);
    }
  }, [selectedRuleFullDetail, setSelectedRuleInStore]);

  const handleCloseDetail = useCallback(() => {
    setDetailDrawerOpen(false);
    setSelectedRuleIdForDetail(null);
    setSelectedRuleInStore(null);
  }, [setSelectedRuleInStore]);

  const handleRefresh = useCallback(() => {
    console.log('RulesExplorer: Manual refresh requested');
    refetch();
    if (selectedRuleIdForDetail && detailDrawerOpen) {
      refetchDetail();
    }
  }, [refetch, selectedRuleIdForDetail, detailDrawerOpen, refetchDetail]);

  // Enhanced export functionality using the new API
  const handleExportRules = useCallback(() => {
    setActionMenuAnchor(null);
    
    const rulesForExport = showBookmarkedOnly ? rulesToDisplay : fetchedRules;
    if (!rulesForExport || rulesForExport.length === 0) {
      alert('No rules to export.');
      return;
    }

    // Use the new export API endpoint
    exportMutation.mutate(
      {
        format: 'csv',
        include_enrichments: true,
        include_raw_content: false, 
        filters: showBookmarkedOnly ? undefined : debugInfo?.currentFilters,
      },
      {
        onSuccess: (response) => {
          // Open the download URL
          window.open(response.download_url, '_blank');
        },
        onError: (error) => {
          console.error('Export failed:', error);
          // Fallback to client-side CSV export
          handleLegacyExport(rulesForExport);
        },
      }
    );
  }, [showBookmarkedOnly, rulesToDisplay, fetchedRules, exportMutation, debugInfo]);

  // Fallback CSV export (client-side)
  const handleLegacyExport = useCallback((rules: RuleSummary[]) => {
    const headers = [
      'ID', 'Title', 'Severity', 'Status', 'Rule Source', 'Rule Platforms', 
      'Linked Technique IDs', 'Has MITRE Mapping', 'Has CVE References',
      'Enrichment Score', 'Created Date', 'Modified Date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...rules.map((rule) => [
        rule.id,
        `"${(rule.title ?? '').replace(/"/g, '""')}"`,
        rule.severity,
        rule.status ?? 'unknown',
        rule.rule_source,
        `"${(rule.rule_platforms ?? []).join('; ')}"`,
        `"${(rule.linked_technique_ids ?? []).join('; ')}"`,
        rule.has_mitre_mapping ? 'Yes' : 'No',
        rule.has_cve_references ? 'Yes' : 'No',
        rule.enrichment_score ?? 0,
        rule.created_date ? formatDate(rule.created_date) : '-',
        rule.modified_date ? formatDate(rule.modified_date) : '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `saint-rules-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Pagination handler
  const handleGridPagination = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    handlePageChange(page);
  }, [handlePageChange]);

  // Content rendering functions
  const renderContent = () => {
    if (effectiveIsLoading && fetchedRules.length === 0) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <LoadingIndicator size={48} />
            <Typography variant="body2" color="text.secondary">
              Loading rules...
            </Typography>
          </Stack>
        </Box>
      );
    }

    if (isError) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorDisplay 
            message={error?.message || 'Failed to load rules'} 
            details={(error as any)?.details ? JSON.stringify((error as any).details) : undefined}
            onRetry={handleRefresh}
          />
        </Box>
      );
    }

    if (rulesToDisplay.length === 0) {
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

    // Render table or grid based on view mode
    if (viewMode === 'table') {
      return (
        <RulesTable
          rules={rulesToDisplay}
          totalRules={currentTotalCountForStatus}
          currentPage={currentPage}
          pageSize={pageSize}
          sortModel={sortModel}
          isLoading={effectiveIsLoading}
          onRuleSelect={handleRuleSelect}
          onPaginationChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      );
    } else {
      return (
        <Suspense fallback={<SkeletonGrid />}>
          <VirtualizedRuleGrid
            rules={rulesToDisplay}
            onRuleSelect={handleRuleSelect}
            isBookmarked={isBookmarked}
            onBookmark={toggleBookmark}
          />
        </Suspense>
      );
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      p: isMobile ? 1 : 3, 
      overflow: 'hidden' 
    }}>
      {/* Header Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2, 
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Bookmarked filter toggle */}
          <FormControlLabel 
            control={
              <Switch 
                checked={showBookmarkedOnly} 
                onChange={handleToggleShowBookmarked} 
              />
            } 
            label={<Typography variant="caption">Show Bookmarked Only</Typography>} 
            sx={{ mr: 1 }}
          />
          
          {/* View mode toggle */}
          <Box sx={{ 
            display: 'flex', 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 1 
          }}>
            <Tooltip title="Table view">
              <IconButton 
                color={viewMode === 'table' ? 'primary' : 'default'} 
                onClick={() => setViewMode('table')}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid view">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => setViewMode('grid')}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={effectiveIsLoading} 
              color="inherit"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Actions menu */}
          <Button 
            variant="outlined" 
            startIcon={<UnfoldMoreIcon />} 
            onClick={(e) => setActionMenuAnchor(e.currentTarget)} 
            disabled={effectiveIsLoading}
          >
            Actions
          </Button>
          <Menu 
            anchorEl={actionMenuAnchor} 
            open={Boolean(actionMenuAnchor)} 
            onClose={() => setActionMenuAnchor(null)}
          >
            <MenuItem 
              onClick={handleExportRules} 
              disabled={rulesToDisplay.length === 0}
            >
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> 
              Export Rules ({showBookmarkedOnly ? 'Bookmarked' : 'All Filtered'})
            </MenuItem>
            <MenuItem 
              component={RouterLink} 
              to="/insights" 
              onClick={() => setActionMenuAnchor(null)}
            >
              View Insights
            </MenuItem>
            <MenuItem 
              component={RouterLink} 
              to="/attack-matrix" 
              onClick={() => setActionMenuAnchor(null)}
            >
              MITRE ATT&CK Matrix
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filter Bar */}
      <RuleFilterBar />

      {/* Status Bar */}
      <RuleStatusBar 
        displayedCount={currentDisplayedCount} 
        totalCount={currentTotalCountForStatus} 
        hasActiveFilters={hasActiveFilters || showBookmarkedOnly} 
        isLoading={effectiveIsLoading} 
        onClearFilters={() => { 
          resetFiltersAndPage(); 
          setShowBookmarkedOnly(false); 
        }} 
      />

      {/* Export status */}
      {exportMutation.isPending && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LoadingIndicator size={16} />
            <Typography variant="body2">Preparing export...</Typography>
          </Stack>
        </Alert>
      )}

      {exportMutation.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Export failed, falling back to basic CSV export.
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        width: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {renderContent()}
      </Box>

      {/* Pagination - only show for table view and when not showing bookmarked only */}
      {totalPages > 1 && !showBookmarkedOnly && viewMode === 'table' && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 2, 
          mt: 1, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          gap: 2, 
          flexWrap: 'wrap' 
        }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handleGridPagination} 
            color="primary" 
            size={isMobile ? 'small' : 'medium'}
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
          />
          <Typography variant="caption" color="text.secondary">
            Page {currentPage} of {totalPages} • {totalRules} total rules
          </Typography>
        </Box>
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
          },
        }}
      >
        <Suspense fallback={
          <Box sx={{ p: 3 }}>
            <LoadingIndicator />
          </Box>
        }>
          {selectedRuleIdForDetail && (
            <LazyRuleDetail
              ruleId={selectedRuleIdForDetail}
              onClose={handleCloseDetail}
              isLoading={isLoadingDetail}
              isError={isErrorDetail}
              error={errorDetail}
              rule={selectedRuleFullDetail}
            />
          )}
        </Suspense>
      </Drawer>
    </Box>
  );
};

export default RulesExplorer;