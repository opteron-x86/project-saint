// src/pages/RulesExplorer/RulesExplorer.tsx
<<<<<<< HEAD
<<<<<<< HEAD

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
<<<<<<< HEAD
=======
//
// A “best-of-both-worlds” merge of the original Rules Explorer page and the new
// enhanced prototype.  — All of the UX / performance upgrades (lazy-loaded
// cards, view-toggle, advanced pagination, CSV export, status bar, bookmarks,
// etc.) are preserved, while the rock-solid pieces from the first version
// (complete filter wiring, rule-source handling, robustness around columns)
// have been re-introduced.
//
// If you already have <RulesTable /> and <RuleCard /> components, no changes
// are needed there, but two new optional props are now supported:
//   • columns  – pass an array of GridColDef for custom table layouts
//   • onRuleBookmark – bookmark toggle callback
//
// NOTE:  you’ll need @mui/x-data-grid in the project (unchanged from v1).

import React, { useState, useCallback, lazy, Suspense } from 'react';
>>>>>>> a380730 (Initial deployment)
=======

<<<<<<< HEAD
import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'; // Added useMemo
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
=======
>>>>>>> 984e985 (backend rework for rule_platforms)
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
<<<<<<< HEAD
<<<<<<< HEAD
  Chip,
  Pagination,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HubIcon from '@mui/icons-material/Hub';
import { GridColDef } from '@mui/x-data-grid';

import { RuleSummary, RuleSeverity } from '@/api/types';
import { LoadingIndicator, ErrorDisplay, EmptyState, StatusBadge } from '@/components/common';
=======
  Grid,
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
  Chip,
  Pagination,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HubIcon from '@mui/icons-material/Hub';
import { GridColDef } from '@mui/x-data-grid';

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { Rule, RuleFilters, RuleSeverity } from '@/api/types';
import {
  LoadingIndicator,
  ErrorDisplay,
  EmptyState,
  StatusBadge,
} from '@/components/common';
>>>>>>> a380730 (Initial deployment)
import { RuleFilterBar, RuleStatusBar } from '@/components/rules';
import RulesTable from '@/components/rules/RulesTable';
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useRuleBookmarks from '@/hooks/data/useRuleBookmarks';
<<<<<<< HEAD
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { SkeletonGrid } from '@/components/rules/RuleCardSkeleton';
import { useRuleStore, useFilterStore } from '@/store';
import { useRuleQuery } from '@/api/queries';
import VirtualizedRuleGrid from '@/components/rules/VirtualizedRuleGrid';

const LazyRuleDetail = lazy(() => import('@/components/rules/RuleDetail'));
const LazyRuleCard = lazy(() => import('@/components/rules/RuleCard'));

const RulesExplorer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const { selectRule: setSelectedRuleInStore } = useRuleStore();
  const { setSearchTerm, clearFilters } = useFilterStore();

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRuleIdForDetail, setSelectedRuleIdForDetail] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  useEffect(() => {
    const initialSearchTerm = location.state?.initialSearchTerm;
    if (initialSearchTerm) {
<<<<<<< HEAD
      clearFilters();
      setSearchTerm(initialSearchTerm);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setSearchTerm, clearFilters]);

  useEffect(() => {
    const ruleIdToOpen = location.state?.openRuleId;
    if (ruleIdToOpen) {
      setSelectedRuleIdForDetail(ruleIdToOpen);
      setDetailDrawerOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
=======
import { extractUniqueValues } from '@/utils/filters';
=======
import { RuleSummary, RuleDetail, RuleSeverity } from '@/api/types'; // Use new types
=======
import { RuleSummary, RuleDetail as RuleDetailType, RuleSeverity } from '@/api/types';
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
=======
import { RuleSummary, RuleSeverity } from '@/api/types';
>>>>>>> bae12e2 (Feature/dashboard improvements)
import { LoadingIndicator, ErrorDisplay, EmptyState, StatusBadge } from '@/components/common';
import { RuleFilterBar, RuleStatusBar } from '@/components/rules';
import RulesTable from '@/components/rules/RulesTable';
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useRuleBookmarks from '@/hooks/data/useRuleBookmarks';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// extractUniqueValues might not be needed if filter options come from store/API
// import { extractUniqueValues } from '@/utils/filters';
>>>>>>> 2f90ce0 (refactor to work with the new backend)
import { SEVERITY_DISPLAY } from '@/utils/constants';
=======
import { SEVERITY_DISPLAY } from '@/utils/constants'; // RuleSeverity comes from api/types now
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
=======
import { SEVERITY_DISPLAY } from '@/utils/constants';
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';
>>>>>>> bae12e2 (Feature/dashboard improvements)
import { formatDate } from '@/utils/format';
import { SkeletonGrid } from '@/components/rules/RuleCardSkeleton';
import { useRuleStore, useFilterStore } from '@/store';
import { useRuleQuery } from '@/api/queries';
import VirtualizedRuleGrid from '@/components/rules/VirtualizedRuleGrid';

const LazyRuleDetail = lazy(() => import('@/components/rules/RuleDetail'));
const LazyRuleCard = lazy(() => import('@/components/rules/RuleCard'));

const RulesExplorer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const { selectRule: setSelectedRuleInStore } = useRuleStore();
  const { setSearchTerm, clearFilters } = useFilterStore();

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRuleIdForDetail, setSelectedRuleIdForDetail] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  useEffect(() => {
    const initialSearch = location.state?.initialSearchTerm;
    if (initialSearch) {
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
      clearFilters();
      setSearchTerm(initialSearchTerm);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setSearchTerm, clearFilters]);

  useEffect(() => {
    const ruleIdToOpen = location.state?.openRuleId;
    if (ruleIdToOpen) {
      setSelectedRuleIdForDetail(ruleIdToOpen);
      setDetailDrawerOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    rules: fetchedRules,
    totalRules,
    currentPage,
    pageSize,
    totalPages,
    sortModel,
    hasActiveFilters,
    isLoading,
<<<<<<< HEAD
<<<<<<< HEAD
    isRefetching,
>>>>>>> a380730 (Initial deployment)
=======
    isFetching, // Use isFetching for more granular loading state
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    isFetching,
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
    isError,
    error,
    handlePageChange,
    handleSortChange,
    refetch,
<<<<<<< HEAD
<<<<<<< HEAD
    resetFiltersAndPage,
  } = usePaginatedRules();

<<<<<<< HEAD
  const {
    data: selectedRuleFullDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
    refetch: refetchDetail,
  } = useRuleQuery(selectedRuleIdForDetail);

  const { bookmarkedRules, toggleBookmark, isBookmarked } = useRuleBookmarks();

  const rulesToDisplay = useMemo(() => {
    if (showBookmarkedOnly) {
      return fetchedRules.filter(rule => bookmarkedRules.has(rule.id));
    }
    return fetchedRules;
  }, [fetchedRules, showBookmarkedOnly, bookmarkedRules]);

  const handleRuleSelect = useCallback((ruleSummary: RuleSummary) => {
    setSelectedRuleIdForDetail(ruleSummary.id);
    setDetailDrawerOpen(true);
  }, []);

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
    refetch();
    if (selectedRuleIdForDetail && detailDrawerOpen) {
      refetchDetail();
    }
  }, [refetch, selectedRuleIdForDetail, detailDrawerOpen, refetchDetail]);

  const handleExportRules = () => {
    setActionMenuAnchor(null);
    const rulesForExport = showBookmarkedOnly ? rulesToDisplay : fetchedRules;
    if (!rulesForExport || rulesForExport.length === 0) {
      alert('No rules to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Validated', 'Rule Source', 'Rule Platforms', 'Linked Technique IDs', 'Created Date', 'Modified Date'];
    const csvContent = [
      headers.join(','),
      ...rulesForExport.map((r) => [
        r.id, `"${(r.title ?? '').replace(/"/g, '""')}"`, r.severity, r.status ?? 'unknown',
        (r as any).raw_rule?.validation_status ?? 'unknown', r.rule_source, `"${(r.rule_platforms ?? []).join('; ')}"`,
        `"${(r.linked_technique_ids ?? []).join('; ')}"`, r.created_date ? formatDate(r.created_date) : '-',
        r.modified_date ? formatDate(r.modified_date) : '-',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rules_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleShowBookmarked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowBookmarkedOnly(event.target.checked);
  };
  
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    handlePageChange(1, Number(event.target.value));
  };

  const columns = useMemo((): GridColDef<RuleSummary>[] => [
    { field: 'title', headerName: 'Rule Name', flex: 1.5, minWidth: 250, renderCell: ({ row }) => <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', cursor:'pointer' }} onClick={() => handleRuleSelect(row)}><Typography variant="body2" fontWeight={500} sx={{ whiteSpace: 'normal', lineHeight: 'tight' }}>{row.title}</Typography></Box> },
    { field: 'severity', headerName: 'Severity', width: 120, renderCell: ({ row }) => <StatusBadge label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity ?? 'Unknown'} status={(row.severity ?? 'unknown').toLowerCase()} size="small" /> },
    { field: 'rule_platforms', headerName: 'Rule Platforms', headerAlign: 'left', align: 'left', width: 180, renderHeader: () => <Box sx={{display: 'flex', alignItems: 'center'}}><LanguageIcon fontSize="inherit" sx={{mr: 0.5, color: 'text.secondary'}}/><Typography variant="caption" fontWeight="medium">Rule Platforms</Typography></Box>, renderCell: ({ row }) => { const rulePlatforms = row.rule_platforms || []; if (rulePlatforms.length === 0) return <Typography variant="caption">-</Typography>; const displayed = rulePlatforms.slice(0, 2); const overflow = rulePlatforms.length - displayed.length; return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>{displayed.map((platform) => <Chip key={`rule-plat-${platform}`} label={platform} size="small" variant="outlined" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />)}{overflow > 0 && <Tooltip title={rulePlatforms.slice(2).join(', ')}><Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700' }} /></Tooltip>}</Box>; } },
    { field: 'linked_technique_ids', headerName: 'Techniques', headerAlign: 'left', align: 'left', width: 200, sortable: false, renderHeader: () => <Box sx={{display: 'flex', alignItems: 'center'}}><HubIcon fontSize="inherit" sx={{mr: 0.5, color: 'text.secondary'}}/><Typography variant="caption" fontWeight="medium">Techniques</Typography></Box>, renderCell: ({ row }) => { const techniques = row.linked_technique_ids || []; if (techniques.length === 0) return <Typography variant="caption">-</Typography>; const displayed = techniques.slice(0, 2); const overflow = techniques.length - displayed.length; return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>{displayed.map((techId) => <Tooltip title={techId} key={techId}><Chip label={techId} size="small" variant="filled" color="primary" clickable component="a" href={`https://attack.mitre.org/techniques/${techId.replace('.', '/')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} sx={{ height: 20, fontSize: '0.7rem', fontFamily: 'monospace' }} /></Tooltip>)}{overflow > 0 && <Tooltip title={techniques.slice(2).join(', ')}><Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700' }} /></Tooltip>}</Box>; } },
    { field: 'status', headerName: 'Status', width: 110, renderCell: ({ row }) => { const status = row.status?.toLowerCase() || 'unknown'; let badgeStatus: 'success' | 'error' | 'default' | 'warning' = 'default'; if (status === 'enabled') badgeStatus = 'success'; else if (status === 'disabled') badgeStatus = 'error'; return <StatusBadge label={row.status || 'Unknown'} status={badgeStatus} size="small" />; } },
    { field: 'validation_status', headerName: 'Validated', width: 120, renderCell: ({ row }) => {
        const validation = (row as any).raw_rule?.validation_status?.toLowerCase();
        if (validation === 'validated') { return <Chip icon={<CheckCircleOutlineIcon />} label="Validated" size="small" color="success" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}} />; }
        else if (validation === 'not_validated') { return <Chip icon={<HighlightOffIcon />} label="Not Validated" size="small" color="error" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}} />; }
        return <Chip icon={<HelpOutlineIcon />} label="Unknown" size="small" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}}/>;
      }
    },
    { field: 'rule_source', headerName: 'Source', width: 120, renderCell: ({ row }) => <Chip label={row.rule_source} size="small" sx={{ height: 20, fontSize: '0.7rem' }} /> },
    { field: 'created_date', headerName: 'Created', width: 130, renderCell: ({ row }) => (row.created_date ? formatDate(row.created_date) : '-') },
    { field: 'modified_date', headerName: 'Modified', width: 130, renderCell: ({ row }) => (row.modified_date ? formatDate(row.modified_date) : '-'), hideable: true },
  ], [handleRuleSelect]);
  
  const effectiveIsLoading = isLoading || isFetching;
  const handleGridPagination = (event: React.ChangeEvent<unknown>, value: number) => handlePageChange(value, pageSize);
  const currentDisplayedCount = rulesToDisplay.length;
  const currentTotalCountForStatus = showBookmarkedOnly ? bookmarkedRules.size : totalRules;

  const renderContent = () => {
    if (effectiveIsLoading && rulesToDisplay.length === 0) {
      return viewMode === 'grid' ? <SkeletonGrid /> : <RulesTable rules={[]} columns={columns} totalRules={0} currentPage={1} pageSize={pageSize} sortModel={sortModel} isLoading={true} onPaginationChange={handlePageChange} onSortChange={handleSortChange} onRuleSelect={handleRuleSelect} />;
    }
    if (isError) {
      return <ErrorDisplay message="Failed to load rules" details={error?.message} retry={true} onRetry={refetch} />;
    }
    if (rulesToDisplay.length === 0) {
      return <EmptyState title={showBookmarkedOnly && !bookmarkedRules.size ? "No Bookmarked Rules" : "No rules found"} description={showBookmarkedOnly && !bookmarkedRules.size ? "You haven't bookmarked any rules yet." : (hasActiveFilters || showBookmarkedOnly) ? 'Try adjusting your filters or search terms.' : 'No rules are available in the database.'} type="noResults" actionText={(hasActiveFilters || showBookmarkedOnly) ? 'Clear All Filters' : undefined} onAction={(hasActiveFilters || showBookmarkedOnly) ? () => { resetFiltersAndPage(); setShowBookmarkedOnly(false); } : undefined} />;
    }
    
    return viewMode === 'table' ? (
      <RulesTable 
        rules={rulesToDisplay} 
        columns={columns} 
        totalRules={totalRules} 
        currentPage={currentPage} 
        pageSize={pageSize} 
        sortModel={sortModel} 
        isLoading={effectiveIsLoading} 
        onPaginationChange={handlePageChange} 
        onSortChange={handleSortChange} 
        onRuleSelect={handleRuleSelect} 
      />
    ) : (
      <Suspense fallback={<SkeletonGrid />}>
        <VirtualizedRuleGrid
          rules={rulesToDisplay}
          isBookmarked={isBookmarked}
          onRuleSelect={handleRuleSelect}
          onBookmark={toggleBookmark}
        />
      </Suspense>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel control={<Switch checked={showBookmarkedOnly} onChange={handleToggleShowBookmarked} />} label={<Typography variant="caption">Show Bookmarked Only</Typography>} sx={{mr: 1}}/>
          <Box sx={{ display: 'flex', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <Tooltip title="Table view"><IconButton color={viewMode === 'table' ? 'primary' : 'default'} onClick={() => setViewMode('table')}><ViewListIcon /></IconButton></Tooltip>
            <Tooltip title="Grid view"><IconButton color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')}><ViewModuleIcon /></IconButton></Tooltip>
          </Box>
          <Tooltip title="Refresh data"><IconButton onClick={handleRefresh} disabled={effectiveIsLoading} color="inherit"><RefreshIcon /></IconButton></Tooltip>
          <Button variant="outlined" startIcon={<UnfoldMoreIcon />} onClick={(e) => setActionMenuAnchor(e.currentTarget)} disabled={effectiveIsLoading}>Actions</Button>
          <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => setActionMenuAnchor(null)}>
            <MenuItem onClick={handleExportRules} disabled={rulesToDisplay.length === 0}><DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Export Displayed Rules (CSV)</MenuItem>
            <MenuItem component={RouterLink} to="/insights" onClick={() => setActionMenuAnchor(null)}>View Insights</MenuItem>
=======
  /* -----------------------------  bookmarks  ------------------------------ */
=======
    resetFiltersAndPage, // This now clears filters in the store and resets page
  } = usePaginatedRules(); // Default initialPage=1, initialPageSize=25
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    resetFiltersAndPage,
  } = usePaginatedRules();
>>>>>>> bbf7a06 (error fixes for rulesexplorer)

  const {
    data: selectedRuleFullDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
    refetch: refetchDetail,
  } = useRuleQuery(selectedRuleIdForDetail);

  const { bookmarkedRules, toggleBookmark, isBookmarked } = useRuleBookmarks();

  const rulesToDisplay = useMemo(() => {
    if (showBookmarkedOnly) {
      return fetchedRules.filter(rule => bookmarkedRules.has(rule.id));
    }
    return fetchedRules;
  }, [fetchedRules, showBookmarkedOnly, bookmarkedRules]);

  const handleRuleSelect = useCallback((ruleSummary: RuleSummary) => {
    setSelectedRuleIdForDetail(ruleSummary.id);
    setDetailDrawerOpen(true);
  }, []);

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
    refetch();
    if (selectedRuleIdForDetail && detailDrawerOpen) {
      refetchDetail();
    }
  }, [refetch, selectedRuleIdForDetail, detailDrawerOpen, refetchDetail]);

  const handleExportRules = () => {
    setActionMenuAnchor(null);
    const rulesForExport = showBookmarkedOnly ? rulesToDisplay : fetchedRules;
    if (!rulesForExport || rulesForExport.length === 0) {
      alert('No rules to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Validated', 'Rule Source', 'Rule Platforms', 'Linked Technique IDs', 'Created Date', 'Modified Date'];
    const csvContent = [
      headers.join(','),
      ...rulesForExport.map((r) => [
        r.id, `"${(r.title ?? '').replace(/"/g, '""')}"`, r.severity, r.status ?? 'unknown',
        (r as any).raw_rule?.validation_status ?? 'unknown', r.rule_source, `"${(r.rule_platforms ?? []).join('; ')}"`,
        `"${(r.linked_technique_ids ?? []).join('; ')}"`, r.created_date ? formatDate(r.created_date) : '-',
        r.modified_date ? formatDate(r.modified_date) : '-',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rules_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleShowBookmarked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowBookmarkedOnly(event.target.checked);
  };
  
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    handlePageChange(1, Number(event.target.value));
  };

  const columns = useMemo((): GridColDef<RuleSummary>[] => [
    { field: 'title', headerName: 'Rule Name', flex: 1.5, minWidth: 250, renderCell: ({ row }) => <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', cursor:'pointer' }} onClick={() => handleRuleSelect(row)}><Typography variant="body2" fontWeight={500} sx={{ whiteSpace: 'normal', lineHeight: 'tight' }}>{row.title}</Typography></Box> },
    { field: 'severity', headerName: 'Severity', width: 120, renderCell: ({ row }) => <StatusBadge label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity ?? 'Unknown'} status={(row.severity ?? 'unknown').toLowerCase()} size="small" /> },
    { field: 'rule_platforms', headerName: 'Rule Platforms', headerAlign: 'left', align: 'left', width: 180, renderHeader: () => <Box sx={{display: 'flex', alignItems: 'center'}}><LanguageIcon fontSize="inherit" sx={{mr: 0.5, color: 'text.secondary'}}/><Typography variant="caption" fontWeight="medium">Rule Platforms</Typography></Box>, renderCell: ({ row }) => { const rulePlatforms = row.rule_platforms || []; if (rulePlatforms.length === 0) return <Typography variant="caption">-</Typography>; const displayed = rulePlatforms.slice(0, 2); const overflow = rulePlatforms.length - displayed.length; return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>{displayed.map((platform) => <Chip key={`rule-plat-${platform}`} label={platform} size="small" variant="outlined" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />)}{overflow > 0 && <Tooltip title={rulePlatforms.slice(2).join(', ')}><Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700' }} /></Tooltip>}</Box>; } },
    { field: 'linked_technique_ids', headerName: 'Techniques', headerAlign: 'left', align: 'left', width: 200, sortable: false, renderHeader: () => <Box sx={{display: 'flex', alignItems: 'center'}}><HubIcon fontSize="inherit" sx={{mr: 0.5, color: 'text.secondary'}}/><Typography variant="caption" fontWeight="medium">Techniques</Typography></Box>, renderCell: ({ row }) => { const techniques = row.linked_technique_ids || []; if (techniques.length === 0) return <Typography variant="caption">-</Typography>; const displayed = techniques.slice(0, 2); const overflow = techniques.length - displayed.length; return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>{displayed.map((techId) => <Tooltip title={techId} key={techId}><Chip label={techId} size="small" variant="filled" color="primary" clickable component="a" href={`https://attack.mitre.org/techniques/${techId.replace('.', '/')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} sx={{ height: 20, fontSize: '0.7rem', fontFamily: 'monospace' }} /></Tooltip>)}{overflow > 0 && <Tooltip title={techniques.slice(2).join(', ')}><Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700' }} /></Tooltip>}</Box>; } },
    { field: 'status', headerName: 'Status', width: 110, renderCell: ({ row }) => { const status = row.status?.toLowerCase() || 'unknown'; let badgeStatus: 'success' | 'error' | 'default' | 'warning' = 'default'; if (status === 'enabled') badgeStatus = 'success'; else if (status === 'disabled') badgeStatus = 'error'; return <StatusBadge label={row.status || 'Unknown'} status={badgeStatus} size="small" />; } },
    { field: 'validation_status', headerName: 'Validated', width: 120, renderCell: ({ row }) => {
        const validation = (row as any).raw_rule?.validation_status?.toLowerCase();
        if (validation === 'validated') { return <Chip icon={<CheckCircleOutlineIcon />} label="Validated" size="small" color="success" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}} />; }
        else if (validation === 'not_validated') { return <Chip icon={<HighlightOffIcon />} label="Not Validated" size="small" color="error" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}} />; }
        return <Chip icon={<HelpOutlineIcon />} label="Unknown" size="small" variant="outlined" sx={{height: 22, fontSize:'0.7rem'}}/>;
      }
    },
    { field: 'rule_source', headerName: 'Source', width: 120, renderCell: ({ row }) => <Chip label={row.rule_source} size="small" sx={{ height: 20, fontSize: '0.7rem' }} /> },
    { field: 'created_date', headerName: 'Created', width: 130, renderCell: ({ row }) => (row.created_date ? formatDate(row.created_date) : '-') },
    { field: 'modified_date', headerName: 'Modified', width: 130, renderCell: ({ row }) => (row.modified_date ? formatDate(row.modified_date) : '-'), hideable: true },
  ], [handleRuleSelect]);
  
  const effectiveIsLoading = isLoading || isFetching;
  const handleGridPagination = (event: React.ChangeEvent<unknown>, value: number) => handlePageChange(value, pageSize);
  const currentDisplayedCount = rulesToDisplay.length;
  const currentTotalCountForStatus = showBookmarkedOnly ? bookmarkedRules.size : totalRules;

  const renderContent = () => {
    if (effectiveIsLoading && rulesToDisplay.length === 0) {
      return viewMode === 'grid' ? <SkeletonGrid /> : <RulesTable rules={[]} columns={columns} totalRules={0} currentPage={1} pageSize={pageSize} sortModel={sortModel} isLoading={true} onPaginationChange={handlePageChange} onSortChange={handleSortChange} onRuleSelect={handleRuleSelect} />;
    }
    if (isError) {
      return <ErrorDisplay message="Failed to load rules" details={error?.message} retry={true} onRetry={refetch} />;
    }
    if (rulesToDisplay.length === 0) {
      return <EmptyState title={showBookmarkedOnly && !bookmarkedRules.size ? "No Bookmarked Rules" : "No rules found"} description={showBookmarkedOnly && !bookmarkedRules.size ? "You haven't bookmarked any rules yet." : (hasActiveFilters || showBookmarkedOnly) ? 'Try adjusting your filters or search terms.' : 'No rules are available in the database.'} type="noResults" actionText={(hasActiveFilters || showBookmarkedOnly) ? 'Clear All Filters' : undefined} onAction={(hasActiveFilters || showBookmarkedOnly) ? () => { resetFiltersAndPage(); setShowBookmarkedOnly(false); } : undefined} />;
    }
    
    return viewMode === 'table' ? (
      <RulesTable 
        rules={rulesToDisplay} 
        columns={columns} 
        totalRules={totalRules} 
        currentPage={currentPage} 
        pageSize={pageSize} 
        sortModel={sortModel} 
        isLoading={effectiveIsLoading} 
        onPaginationChange={handlePageChange} 
        onSortChange={handleSortChange} 
        onRuleSelect={handleRuleSelect} 
      />
    ) : (
      <Suspense fallback={<SkeletonGrid />}>
        <VirtualizedRuleGrid
          rules={rulesToDisplay}
          isBookmarked={isBookmarked}
          onRuleSelect={handleRuleSelect}
          onBookmark={toggleBookmark}
        />
      </Suspense>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel control={<Switch checked={showBookmarkedOnly} onChange={handleToggleShowBookmarked} />} label={<Typography variant="caption">Show Bookmarked Only</Typography>} sx={{mr: 1}}/>
          <Box sx={{ display: 'flex', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <Tooltip title="Table view"><IconButton color={viewMode === 'table' ? 'primary' : 'default'} onClick={() => setViewMode('table')}><ViewListIcon /></IconButton></Tooltip>
            <Tooltip title="Grid view"><IconButton color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')}><ViewModuleIcon /></IconButton></Tooltip>
          </Box>
<<<<<<< HEAD
<<<<<<< HEAD

          {/* refresh */}
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* actions */}
          <Button
            variant="outlined"
            startIcon={<UnfoldMoreIcon />}
            onClick={(e) => setActionMenuAnchor(e.currentTarget)}
            disabled={isLoading}
          >
            Actions
          </Button>

          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={() => setActionMenuAnchor(null)}
          >
            <MenuItem onClick={handleExportRules}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Export Rules
            </MenuItem>
            <MenuItem onClick={handleShowBookmarked}>
              <BookmarkIcon fontSize="small" sx={{ mr: 1 }} />
              Show Bookmarked
            </MenuItem>
            <MenuItem
              onClick={() => {
                setActionMenuAnchor(null);
                window.location.href = '/insights';
              }}
            >
              <InsightsIcon fontSize="small" sx={{ mr: 1 }} />
              View Insights
            </MenuItem>
>>>>>>> a380730 (Initial deployment)
=======
          <Tooltip title="Refresh data"><IconButton onClick={handleRefresh} disabled={effectiveIsLoading}><RefreshIcon /></IconButton></Tooltip>
=======
          <Tooltip title="Refresh data"><IconButton onClick={handleRefresh} disabled={effectiveIsLoading} color="inherit"><RefreshIcon /></IconButton></Tooltip>
>>>>>>> bae12e2 (Feature/dashboard improvements)
          <Button variant="outlined" startIcon={<UnfoldMoreIcon />} onClick={(e) => setActionMenuAnchor(e.currentTarget)} disabled={effectiveIsLoading}>Actions</Button>
          <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => setActionMenuAnchor(null)}>
<<<<<<< HEAD
            <MenuItem onClick={handleExportRules} disabled={rules.length === 0}><DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Export Rules (CSV)</MenuItem>
            <MenuItem onClick={handleShowBookmarked}><BookmarkIcon fontSize="small" sx={{ mr: 1 }} /> Show Bookmarked (WIP)</MenuItem>
<<<<<<< HEAD
            {/* <MenuItem component={RouterLink} to="/insights" onClick={() => setActionMenuAnchor(null)}>
              <InsightsIcon fontSize="small" sx={{ mr: 1 }} /> View Insights
            </MenuItem> */}
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
=======
            <MenuItem onClick={handleExportRules} disabled={rulesToDisplay.length === 0}><DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Export Displayed Rules (CSV)</MenuItem>
<<<<<<< HEAD
            {/* Removed "Show Bookmarked (WIP)" menu item as it's now a toggle switch */}
>>>>>>> 1d4ee69 (bookmark feature and initial dashboard build)
            <MenuItem component={RouterLink} to="/insights" onClick={() => setActionMenuAnchor(null)}>
              View Insights
            </MenuItem>
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
=======
            <MenuItem component={RouterLink} to="/insights" onClick={() => setActionMenuAnchor(null)}>View Insights</MenuItem>
>>>>>>> bae12e2 (Feature/dashboard improvements)
          </Menu>
        </Box>
      </Box>

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      <RuleFilterBar />
      <RuleStatusBar displayedCount={currentDisplayedCount} totalCount={currentTotalCountForStatus} hasActiveFilters={hasActiveFilters || showBookmarkedOnly} isLoading={effectiveIsLoading} onClearFilters={() => { resetFiltersAndPage(); setShowBookmarkedOnly(false); }} />
<<<<<<< HEAD

      <Box sx={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>

      {totalPages > 1 && !showBookmarkedOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, mt: 1, borderTop: `1px solid ${theme.palette.divider}`, gap: 2, flexWrap: 'wrap' }}>
          <Pagination count={totalPages} page={currentPage} onChange={handleGridPagination} color="primary" size={isMobile ? "small" : "medium"} showFirstButton showLastButton />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="page-size-select-label">Per Page</InputLabel>
            <Select
              labelId="page-size-select-label"
              value={pageSize}
              label="Per Page"
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZES.map(size => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Drawer anchor="right" open={detailDrawerOpen} onClose={handleCloseDetail} PaperProps={{ sx: { width: isMobile ? '100%' : 'clamp(500px, 40vw, 700px)' } }}>
        <Suspense fallback={<Box sx={{p:3}}><LoadingIndicator message="Loading rule details…" /></Box>}>
          {isLoadingDetail && <Box sx={{p:3}}><LoadingIndicator message="Loading rule details..." /></Box>}
<<<<<<< HEAD
          {isErrorDetail && <ErrorDisplay message="Failed to load rule details." details={errorDetail?.message} retry={true} onRetry={() => {if(selectedRuleIdForDetail) refetchDetail()}} />}
          {selectedRuleFullDetail && !isLoadingDetail && !isErrorDetail && <LazyRuleDetail rule={selectedRuleFullDetail} isBookmarked={isBookmarked(selectedRuleFullDetail.id)} onClose={handleCloseDetail} onBookmark={() => toggleBookmark(selectedRuleFullDetail.id)} />}
        </Suspense>
=======
      {/* ───────────── Filters ───────────── */}
      <RuleFilterBar
        filters={filters}
        availablePlatforms={availablePlatforms}
        availableRuleSources={availableRuleSources}
        availableTactics={availableTactics}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
=======
      {/* RuleFilterBar no longer needs props for options/handlers */}
=======
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
      <RuleFilterBar />
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
      <RuleFilterBar /> {/* This component is now self-contained with store access */}
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
      <RuleFilterBar />
>>>>>>> 318d3ed (fixes for rule explorer)
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)

      <Box sx={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>

      {totalPages > 1 && !showBookmarkedOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, mt: 1, borderTop: `1px solid ${theme.palette.divider}`, gap: 2, flexWrap: 'wrap' }}>
          <Pagination count={totalPages} page={currentPage} onChange={handleGridPagination} color="primary" size={isMobile ? "small" : "medium"} showFirstButton showLastButton />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="page-size-select-label">Per Page</InputLabel>
            <Select
              labelId="page-size-select-label"
              value={pageSize}
              label="Per Page"
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZES.map(size => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

<<<<<<< HEAD
<<<<<<< HEAD
      {/* ───────────── Drawer ───────────── */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={handleCloseDetail}
        PaperProps={{ sx: { width: isMobile ? '100%' : 500 } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<LoadingIndicator message="Loading rule details…" />}>
            {selectedRule && (
              <RuleDetail
                rule={selectedRule}
                isBookmarked={isBookmarked(selectedRule.id)}
                onClose={handleCloseDetail}
                onBookmark={() => toggleBookmark(selectedRule.id)}
              />
            )}
          </Suspense>
        </Box>
>>>>>>> a380730 (Initial deployment)
=======
      {/* Detail Drawer */}
=======
>>>>>>> bbf7a06 (error fixes for rulesexplorer)
      <Drawer anchor="right" open={detailDrawerOpen} onClose={handleCloseDetail} PaperProps={{ sx: { width: isMobile ? '100%' : 'clamp(500px, 40vw, 700px)' } }}>
        <Suspense fallback={<Box sx={{p:3}}><LoadingIndicator message="Loading rule details…" /></Box>}>
          {(isLoadingDetail && !selectedRuleFullDetail) && <Box sx={{p:3}}><LoadingIndicator message="Loading rule details..." /></Box>}
=======
>>>>>>> 37ba2d8 (Initial commit)
          {isErrorDetail && <ErrorDisplay message="Failed to load rule details." details={errorDetail?.message} retry={true} onRetry={() => {if(selectedRuleIdForDetail) refetchDetail()}} />}
          {selectedRuleFullDetail && !isLoadingDetail && !isErrorDetail && <LazyRuleDetail rule={selectedRuleFullDetail} isBookmarked={isBookmarked(selectedRuleFullDetail.id)} onClose={handleCloseDetail} onBookmark={() => toggleBookmark(selectedRuleFullDetail.id)} />}
        </Suspense>
>>>>>>> 2f90ce0 (refactor to work with the new backend)
      </Drawer>
    </Box>
  );
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export default RulesExplorer;
=======
export default RulesExplorer;
>>>>>>> a380730 (Initial deployment)
=======
export default RulesExplorer;
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
export default RulesExplorer;
<<<<<<< HEAD

>>>>>>> 984e985 (backend rework for rule_platforms)
=======
>>>>>>> 318d3ed (fixes for rule explorer)
=======
export default RulesExplorer;
>>>>>>> 1d4ee69 (bookmark feature and initial dashboard build)
=======
export default RulesExplorer;
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
export default RulesExplorer;
>>>>>>> 37ba2d8 (Initial commit)
