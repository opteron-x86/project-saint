// src/pages/AttackMatrix/AttackMatrix.tsx
import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  IconButton,
  Drawer,
  Tabs,
  Tab,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Theme } from '@mui/material/styles';
import { FEATURE_FLAGS, UNDER_CONSTRUCTION_CONFIG } from '@/utils/featureFlags';
import UnderConstructionWrapper from '@/components/common/UnderConstructionWrapper';

// Corrected imports using '@/' alias
import { SearchBar, StatusBadge, EmptyState, LoadingIndicator, ErrorDisplay } from '@/components/common';
import {
  useFilterStore,
  usePlatformOptions as useAttackPlatformOptions,
  useIsLoadingOptions,
  useOptionsError as useFilterOptionsError,
} from '@/store';
import { useRuleStore } from '@/store';
import {
    MitreTactic,
    MitreTechnique,
    TechniquesCoverageResponse,
    FilterOption,
    TechniqueRuleInfo,
} from '@/api/types';
import { useMitreAttackData } from '@/hooks/data/useMitreAttackData';
import { useRuleQuery } from '@/api/queries';

import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// Lazy load the RuleDetail component for better initial page load performance
const LazyRuleDetail = lazy(() => import('@/components/rules/RuleDetail'));

// --- Constants ---
const CELL_HEIGHT = 76;
const SUBTECHNIQUE_CELL_HEIGHT = 60;
const CELL_MIN_WIDTH = 200;
const SUBTECHNIQUE_INDENT = 16;


// --- TYPE DEFINITIONS ---
interface DrawerHistoryState {
  mode: 'tactic' | 'technique' | 'rule';
  tacticId: string | null;
  techniqueId: string | null;
  tab: number;
}

// --- Main Component ---
const AttackMatrix: React.FC = () => {
  // --- ALL HOOKS CALLED AT THE TOP LEVEL ---
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { filters, setPlatforms, fetchAllFilterOptions } = useFilterStore();
  const attackPlatformOptions: FilterOption[] = useAttackPlatformOptions();
  const isLoadingPlatformOptions = useIsLoadingOptions();
  const platformOptionsError = useFilterOptionsError();
  const { selectRule } = useRuleStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContentMode, setDrawerContentMode] = useState<'tactic' | 'technique' | 'rule'>('technique');
  const [historyStack, setHistoryStack] = useState<DrawerHistoryState[]>([]);

  const [selectedTacticId, setSelectedTacticId] = useState<string | null>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set());
  const [platformFilterAnchorEl, setPlatformFilterAnchorEl] = useState<null | HTMLElement>(null);

  const { matrix: rawMatrixData, coverage: coverageData, isLoading: isLoadingMatrixAndCoverage, isError: isErrorMatrixAndCoverage, error: errorMatrixAndCoverage } = useMitreAttackData();
  const { data: fetchedFullRuleDetail, isLoading: isLoadingFullRuleDetail, isError: isErrorFullRuleDetail, error: errorFullRuleDetail, refetch: refetchFullRuleDetail } = useRuleQuery(selectedRuleId);

  // --- Effects ---
  useEffect(() => {
    if (fetchedFullRuleDetail) {
      selectRule(fetchedFullRuleDetail);
    }
  }, [fetchedFullRuleDetail, selectRule]);

  useEffect(() => {
    // This effect ensures filter options are fetched on mount if they aren't already available.
    if (!isLoadingPlatformOptions && !platformOptionsError && attackPlatformOptions.length === 0) {
      fetchAllFilterOptions();
    }
  }, [fetchAllFilterOptions, isLoadingPlatformOptions, platformOptionsError, attackPlatformOptions.length]);

  // --- Memoized Calculations ---
  const filteredAndSortedMatrix = useMemo((): MitreTactic[] | null => {
    if (!rawMatrixData) return null;
    const searchLower = searchTerm.toLowerCase().trim();
    const hasPlatformFilter = (filters.platforms || []).length > 0;
    const techniqueMatches = (tech: MitreTechnique) => {
        if (tech.is_deprecated) return false;
        const platformMatch = !hasPlatformFilter || (tech.platforms || []).some(p => (filters.platforms || []).includes(p));
        const searchMatch = !searchLower || tech.name?.toLowerCase().includes(searchLower) || tech.id?.toLowerCase().includes(searchLower);
        return platformMatch && searchMatch;
    };
    return (rawMatrixData || []).map(tactic => ({
        ...tactic,
        techniques: (tactic.techniques || []).map(tech => ({
            ...tech,
            subtechniques: (tech.subtechniques || []).filter(techniqueMatches)
        })).filter(tech => techniqueMatches(tech) || (tech.subtechniques || []).length > 0)
    })).filter(tactic => tactic.techniques.length > 0)
    .sort((a, b) => (a.matrix_order ?? Infinity) - (b.matrix_order ?? Infinity));
  }, [rawMatrixData, searchTerm, filters.platforms]);

  const selectedTactic = useMemo(() => (rawMatrixData || []).find(t => t.id === selectedTacticId) || null, [rawMatrixData, selectedTacticId]);
  
  const selectedTechnique = useMemo(() => {
    if (!selectedTechniqueId || !rawMatrixData) return null;
    for (const tactic of rawMatrixData) {
        for (const technique of tactic.techniques) {
            if (technique.id === selectedTechniqueId) return technique;
            if (technique.subtechniques) {
                for (const subtechnique of technique.subtechniques) {
                    if (subtechnique.id === selectedTechniqueId) return subtechnique;
                }
            }
        }
    }
    return null;
  }, [rawMatrixData, selectedTechniqueId]);

  // --- Event Handlers ---
  const toggleTechniqueExpansion = useCallback((techniqueId: string) => {
    setExpandedTechniques(prev => { const newSet = new Set(prev); newSet.has(techniqueId) ? newSet.delete(techniqueId) : newSet.add(techniqueId); return newSet; });
  }, []);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue), []);
  
  const handleTacticSelect = useCallback((tacticId: string) => {
      setSelectedTacticId(tacticId);
      setSelectedTechniqueId(null);
      setSelectedRuleId(null);
      setDrawerContentMode('tactic');
      setHistoryStack([]);
      setDrawerOpen(true);
      setTabValue(0);
  }, []);
  
  const handleTechniqueSelect = useCallback((techniqueId: string, tacticId: string) => {
      setSelectedTacticId(tacticId);
      setSelectedTechniqueId(techniqueId);
      setSelectedRuleId(null);
      setDrawerContentMode('technique');
      setHistoryStack([]);
      setDrawerOpen(true);
      setTabValue(0);
  }, []);

  const handleRuleSelect = useCallback((ruleInfo: TechniqueRuleInfo) => {
    const currentState: DrawerHistoryState = {
      mode: drawerContentMode,
      tacticId: selectedTacticId,
      techniqueId: selectedTechniqueId,
      tab: tabValue
    };
    setHistoryStack(prev => [...prev, currentState]);
    setSelectedRuleId(ruleInfo.id);
    setDrawerContentMode('rule');
  }, [drawerContentMode, selectedTacticId, selectedTechniqueId, tabValue]);

  const handleDrawerBack = useCallback(() => {
    if (historyStack.length > 0) {
      const lastState = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      
      setDrawerContentMode(lastState.mode);
      setSelectedTacticId(lastState.tacticId);
      setSelectedTechniqueId(lastState.techniqueId);
      setTabValue(lastState.tab);
      setSelectedRuleId(null);
    }
  }, [historyStack]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setHistoryStack([]);
    setTimeout(() => {
        setSelectedTacticId(null);
        setSelectedTechniqueId(null);
        setSelectedRuleId(null);
        setTabValue(0);
    }, 300);
  }, []);

  const getCellColor = useCallback((techniqueId: string): string => {
    const count = coverageData?.techniques.find(tc => tc.technique_id === techniqueId)?.count || 0;
    if (count === 0) return alpha(theme.palette.background.default, 0.7);
    if (count < 3) return theme.palette.mode === 'dark' ? alpha(theme.palette.info.dark, 0.3) : alpha(theme.palette.info.light, 0.4);
    if (count < 6) return theme.palette.mode === 'dark' ? alpha(theme.palette.info.dark, 0.5) : alpha(theme.palette.info.light, 0.6);
    if (count < 10) return theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.6) : alpha(theme.palette.info.main, 0.5);
    return theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.8) : alpha(theme.palette.info.main, 0.7);
  }, [coverageData, theme]);

  const getTextColor = useCallback((techniqueId: string): string => {
    const count = coverageData?.techniques.find(tc => tc.technique_id === techniqueId)?.count || 0;
    return count >= 10 ? theme.palette.info.contrastText : theme.palette.text.primary;
  }, [coverageData, theme]);

  const handlePlatformFilterOpen = useCallback((event: React.MouseEvent<HTMLElement>) => setPlatformFilterAnchorEl(event.currentTarget), []);
  const handlePlatformFilterClose = useCallback(() => setPlatformFilterAnchorEl(null), []);
  
  const handlePlatformSelectionChange = useCallback((platformValue: string) => {
    const newSelectedPlatforms = (filters.platforms || []).includes(platformValue)
      ? (filters.platforms || []).filter(p => p !== platformValue)
      : [...(filters.platforms || []), platformValue];
    setPlatforms(newSelectedPlatforms);
  }, [filters.platforms, setPlatforms]);

  const clearPlatformFilters = useCallback(() => setPlatforms([]), [setPlatforms]);

  // --- Render Logic ---
  const isLoadingDisplay = isLoadingMatrixAndCoverage || isLoadingPlatformOptions;
  const displayTactics = filteredAndSortedMatrix || [];
  const buttonHref = (drawerContentMode === 'technique' ? selectedTechnique?.url : selectedTactic?.url) || undefined;

  const renderMatrixContent = () => {
    if (isLoadingDisplay) {
      return <LoadingIndicator message="Loading matrix data..." />;
    }
    if (isErrorMatrixAndCoverage) {
      return <ErrorDisplay message="Failed to load ATT&CK matrix" details={String(errorMatrixAndCoverage)} retry onRetry={() => window.location.reload()} />;
    }
    if (displayTactics.length === 0) {
      return (
        <EmptyState 
          title="No Matching Data" 
          description="No tactics/techniques match your current filters." 
          type="noResults"
          actionText="Clear Search/Filters" 
          onAction={() => { setSearchTerm(''); setPlatforms([]); }}
        />
      );
    }
    return (
      <AutoSizer>
        {({ height, width }: { height: number; width: number; }) => (
          <Box sx={{ height, width, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: isMobile ? 0.5 : 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1, width: 'max-content', minWidth: '100%' }}>
              {displayTactics.map((tactic: MitreTactic) => (
                <Box key={tactic.id} sx={{ flex: `0 0 ${CELL_MIN_WIDTH}px`, minWidth: CELL_MIN_WIDTH, maxWidth: CELL_MIN_WIDTH, p: 0.5, mr: isMobile ? 0.5 : 1 }}>
                  <TacticHeader tactic={tactic} onSelect={handleTacticSelect} theme={theme} />
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'auto', flex: 1, width: 'max-content', minWidth: '100%' }}>
              {displayTactics.map((tactic: MitreTactic) => (
                <Box key={`techlist-${tactic.id}`} sx={{ flex: `0 0 ${CELL_MIN_WIDTH}px`, minWidth: CELL_MIN_WIDTH, maxWidth: CELL_MIN_WIDTH, p: 0.5, mr: isMobile ? 0.5 : 1, height: '100%' }}>
                  <VirtualizedTechniqueList
                    tactic={tactic} expandedTechniques={expandedTechniques} coverageData={coverageData || null} 
                    handleTechniqueSelect={handleTechniqueSelect} toggleTechniqueExpansion={toggleTechniqueExpansion}
                    getCellColor={getCellColor} getTextColor={getTextColor} theme={theme}
                    height={Math.max(100, height - (isMobile ? 70 : 80) - 16)}
                    width={CELL_MIN_WIDTH - (isMobile? 4 : 8)}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </AutoSizer>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={handlePlatformFilterOpen} color={filters.platforms && filters.platforms.length > 0 ? 'primary' : 'inherit'}>
            Platform ({(filters.platforms || []).length})
          </Button>
          <Tooltip title="Refresh data"><IconButton onClick={() => window.location.reload()} size="small" disabled={isLoadingDisplay}><RefreshIcon /></IconButton></Tooltip>
          <Tooltip title="Export matrix (WIP)"><IconButton size="small"><DownloadIcon /></IconButton></Tooltip>
        </Box>
      </Box>

      {/* Platform Filter Popover */}
      <Popover open={Boolean(platformFilterAnchorEl)} anchorEl={platformFilterAnchorEl} onClose={handlePlatformFilterClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left'}} PaperProps={{ sx: { maxHeight: 300, width: 250, overflowY: 'auto' }}}>
        <Box sx={{p: 1.5}}>
          <Typography variant="subtitle2" gutterBottom sx={{px:1, pt:0.5}}>Filter by Platform</Typography>
          {isLoadingPlatformOptions ? <Box sx={{display:'flex', justifyContent:'center',p:1}}><CircularProgress size={20}/></Box>
           : platformOptionsError ? <Typography variant="caption" color="error" sx={{px:1}}>Error loading platforms.</Typography>
           : <FormGroup sx={{ pl: 1, pr:1 }}>
              {attackPlatformOptions.length > 0 ? attackPlatformOptions.map((option: FilterOption) => (
                <FormControlLabel key={option.value} control={ <Checkbox checked={(filters.platforms || []).includes(option.value)} onChange={() => handlePlatformSelectionChange(option.value)} size="small"/> }
                  label={<Typography variant="body2" sx={{fontSize:'0.875rem'}}>{option.label}</Typography>}
                />
              )) : <Typography variant="caption" sx={{p:1}}>No platforms listed.</Typography>}
            </FormGroup>
          }
          <Divider sx={{mt:1, mb:1}}/>
          <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', p:0.5, pl:1, pr:1}}>
            <Button size="small" onClick={clearPlatformFilters} disabled={(filters.platforms || []).length === 0} sx={{fontSize:'0.75rem'}}>Clear</Button>
            <Button size="small" onClick={handlePlatformFilterClose} sx={{fontSize:'0.75rem'}}>Close</Button>
          </Box>
        </Box>
      </Popover>

      {/* Search and Filter Chips */}
      <Box sx={{ mb: 2, width: '100%', maxWidth: {sm: 350} }}>
        <SearchBar placeholder="Search techniques, tactics..." onSearch={setSearchTerm} initialValue={searchTerm}/>
      </Box>
      {(filters.platforms && filters.platforms.length > 0) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Active Platforms:</Typography>
          {(filters.platforms || []).map((platformValue: string) => {
            const platformLabel = attackPlatformOptions.find(opt => opt.value === platformValue)?.label || platformValue;
            return <Chip key={platformValue} label={platformLabel} size="small" onDelete={() => handlePlatformSelectionChange(platformValue)} color="primary" variant='outlined' />;
          })}
        </Box>
      )}

      {/* Main Matrix Content */}
      <Paper elevation={0} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', minHeight: 300 }}>
        {renderMatrixContent()}
      </Paper>

      {/* Legend */}
      <Paper elevation={0} sx={{ p: 1.5, mt: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" fontWeight={500}>Coverage:</Typography>
        {[
          { label: 'No Rules', color: alpha(theme.palette.background.default, 0.7) },
          { label: 'Low (1-2)', color: theme.palette.mode === 'dark' ? alpha(theme.palette.info.dark, 0.3) : alpha(theme.palette.info.light, 0.4) },
          { label: 'Medium (3-5)', color: theme.palette.mode === 'dark' ? alpha(theme.palette.info.dark, 0.5) : alpha(theme.palette.info.light, 0.6) },
          { label: 'Good (6-9)', color: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.6) : alpha(theme.palette.info.main, 0.5) },
          { label: 'Excellent (10+)', color: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.8) : alpha(theme.palette.info.main, 0.7) },
        ].map(item => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: item.color, border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}` }}/>
            <Typography variant="caption" sx={{fontSize: '0.7rem'}}>{item.label}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Details Drawer with Dynamic Content */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose} PaperProps={{ sx: { width: isMobile ? '95%' : 'clamp(500px, 40vw, 700px)' }}}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{overflow:'hidden', display: 'flex', alignItems: 'center', gap: 1}}>
                  {historyStack.length > 0 && drawerContentMode === 'rule' && (
                    <Tooltip title="Back to technique">
                      <IconButton onClick={handleDrawerBack} size="small"><ArrowBackIcon /></IconButton>
                    </Tooltip>
                  )}
                  <Box sx={{overflow:'hidden'}}>
                    {drawerContentMode === 'rule' && fetchedFullRuleDetail && <Tooltip title={fetchedFullRuleDetail.title}><Typography variant="h6" noWrap>{fetchedFullRuleDetail.title}</Typography></Tooltip>}
                    {drawerContentMode === 'technique' && selectedTechnique && <Tooltip title={selectedTechnique.name}><Typography variant="h6" noWrap>{selectedTechnique.name}</Typography></Tooltip>}
                    {drawerContentMode === 'tactic' && selectedTactic && <Tooltip title={selectedTactic.name}><Typography variant="h6" noWrap>{selectedTactic.name}</Typography></Tooltip>}
                  </Box>
              </Box>
              <IconButton onClick={handleDrawerClose}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {drawerContentMode === 'rule' ? (
                <Suspense fallback={<Box sx={{p:3}}><LoadingIndicator message="Loading rule details…" /></Box>}>
                    {isLoadingFullRuleDetail && <LoadingIndicator message="Loading rule..." />}
                    {isErrorFullRuleDetail && <ErrorDisplay message="Failed to load rule details" details={String(errorFullRuleDetail)} retry onRetry={refetchFullRuleDetail} />}
                    {fetchedFullRuleDetail && <LazyRuleDetail rule={fetchedFullRuleDetail} onClose={handleDrawerClose} />}
                </Suspense>
            ) : (
                <>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="matrix details tabs" variant="fullWidth" sx={{borderBottom: 1, borderColor: 'divider', bgcolor:'background.paper', position:'sticky', top:0, zIndex:1}}>
                        <Tab icon={<InfoOutlinedIcon fontSize="small" />} iconPosition="start" label="Overview" />
                        <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start"
                            label={ <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> Rules
                                {selectedTechniqueId && (coverageData?.techniques?.find(t => t.technique_id === selectedTechniqueId)?.count ?? 0) > 0 && (
                                    <Chip label={coverageData?.techniques?.find(t => t.technique_id === selectedTechniqueId)?.count} size="small" sx={{ height: 18, fontSize: '0.65rem'}}/>
                                )}
                                </Box>}
                            disabled={drawerContentMode === 'tactic'} />
                    </Tabs>
                    <Box sx={{p:2}}>
                        {tabValue === 0 && ( /* Overview Tab */
                          <>
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">Description</Typography>
                            <Typography variant="body2" paragraph sx={{whiteSpace: 'pre-wrap', color:'text.secondary', maxHeight: '40vh', overflowY:'auto', pr:1}}>
                                {drawerContentMode === 'technique' && (selectedTechnique?.description || "No description available.")}
                                {drawerContentMode === 'tactic' && (selectedTactic?.description || "No description available.")}
                            </Typography>
                            {drawerContentMode === 'technique' && selectedTechnique?.platforms && selectedTechnique.platforms.length > 0 && (
                                <Box sx={{ my: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="medium">Platforms:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedTechnique.platforms.map(p => <Chip key={p} label={p} size="small" variant="outlined"/>)}
                                    </Box>
                                </Box>
                            )}
                            <Button
                              fullWidth
                              variant="outlined"
                              color="primary"
                              component={buttonHref ? 'a' : 'button'}
                              href={buttonHref}
                              target={buttonHref ? '_blank' : undefined}
                              rel={buttonHref ? 'noopener noreferrer' : undefined}
                              disabled={!buttonHref}
                              startIcon={<InfoOutlinedIcon />}
                              sx={{ mt: 1.5 }}
                            >
                              View on MITRE ATT&CK
                            </Button>
                          </>
                        )}
                        {tabValue === 1 && ( /* Rules Tab */
                           (selectedTechniqueId && coverageData?.techniques) ? (() => {
                                const techCoverage = coverageData.techniques.find(t => t.technique_id === selectedTechniqueId);
                                if (!techCoverage || techCoverage.rules.length === 0) return <EmptyState title="No Rules Found" description={`No rules associated with ${selectedTechnique?.name || ''}.`} height={150}/>
                                return (
                                    <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr:0.5}}>
                                        {techCoverage.rules.map((rule: TechniqueRuleInfo) => ( 
                                        <Paper key={rule.id} elevation={0} variant="outlined" sx={{ p: 1.5, mb: 1, cursor:'pointer', '&:hover': {bgcolor: 'action.hover'}}} onClick={() => handleRuleSelect(rule)}>
                                            <Typography variant="subtitle2" fontWeight={500}>{rule.title}</Typography>
                                            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mt:0.5}}>
                                                <Chip label={rule.id} size="small" sx={{fontSize:'0.7rem', fontFamily:'monospace'}} variant="outlined"/>
                                                <StatusBadge label={rule.severity} status={rule.severity.toLowerCase()} size="small"/>
                                            </Box>
                                        </Paper>
                                        ))}
                                    </Box>
                                );
                            })() : <EmptyState title="No Technique Selected" description="Select a technique to view its associated rules." height={150}/>
                        )}
                    </Box>
                </>
            )}
          </Box>
      </Drawer>

    </Box>
  );
};

// --- Memoized Sub-Components for Performance ---
// NOTE: These components are kept separate for clarity and performance.

const TacticHeader: React.FC<{
  tactic: MitreTactic;
  onSelect: (tacticId: string) => void;
  theme: Theme;
}> = React.memo(({ tactic, onSelect, theme }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 80,
        bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText,
        borderRadius: '4px 4px 0 0', cursor: 'pointer',
        transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], { duration: theme.transitions.duration.shortest }),
        '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'translateY(-2px)', boxShadow: 2 },
      }}
      onClick={() => onSelect(tactic.id)}
    >
      <Typography variant="subtitle2" fontWeight={600} align="center">{tactic.name}</Typography>
      <Typography variant="caption" align="center">{tactic.id}</Typography>
    </Paper>
  );
});
TacticHeader.displayName = 'TacticHeader';


const TechniqueCell: React.FC<{
  technique: MitreTechnique;
  tactic: MitreTactic;
  expanded: boolean;
  coverageData: TechniquesCoverageResponse | null;
  onExpand: (techniqueId: string) => void;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ technique, tactic, expanded, coverageData, onExpand, onSelect, cellColor, textColor, theme }) => {
  const hasSubtechniques = technique.subtechniques && technique.subtechniques.length > 0 && technique.subtechniques.some(st => !st.is_deprecated);
  const techniqueCoverage = coverageData?.techniques.find(tc => tc.technique_id === technique.id);
  const coverageCount = techniqueCoverage?.count || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: CELL_HEIGHT, width: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center', padding: 1,
        bgcolor: cellColor, color: textColor, border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1, cursor: 'pointer', overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow'], { duration: theme.transitions.duration.shortest }),
        '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' },
      }}
      onClick={() => onSelect(technique.id, tactic.id)}
    >
      <Box sx={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
        <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'center', lineHeight: 1.2, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {technique.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 'auto' }}>
        <Typography variant="caption">{technique.id}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {coverageCount > 0 && (
            <Chip label={coverageCount} size="small" sx={{ height: 20, minWidth: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: theme.palette.background.paper, color: 'text.primary' }} />
          )}
          {hasSubtechniques && (
            <Tooltip title={expanded ? "Collapse" : "Expand subtechniques"}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onExpand(technique.id); }} sx={{ p: 0, ml: 0.5, color: 'inherit', '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) } }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
});
TechniqueCell.displayName = 'TechniqueCell';


const SubtechniqueCell: React.FC<{
  subtechnique: MitreTechnique;
  tactic: MitreTactic;
  coverageData: TechniquesCoverageResponse | null;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ subtechnique, tactic, coverageData, onSelect, cellColor, textColor, theme }) => {
  const subtechniqueCoverage = coverageData?.techniques.find(tc => tc.technique_id === subtechnique.id);
  const coverageCount = subtechniqueCoverage?.count || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: SUBTECHNIQUE_CELL_HEIGHT, width: `calc(100% - ${SUBTECHNIQUE_INDENT}px)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
        padding: 1, ml: `${SUBTECHNIQUE_INDENT}px`, bgcolor: cellColor, color: textColor,
        border: `1px solid ${theme.palette.divider}`, borderRadius: 1, cursor: 'pointer',
        position: 'relative',
        transition: theme.transitions.create(['transform', 'box-shadow'], { duration: theme.transitions.duration.shortest }),
        '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' },
        '&::before': { content: '""', position: 'absolute', top: -10, left: -SUBTECHNIQUE_INDENT / 2, width: SUBTECHNIQUE_INDENT / 2, height: 20, borderLeft: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}`, borderBottomLeftRadius: 4 }
      }}
      onClick={() => onSelect(subtechnique.id, tactic.id)}
    >
      <Box sx={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
        <Typography variant="caption" fontWeight={500} sx={{ textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {subtechnique.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 'auto' }}>
        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{subtechnique.id}</Typography>
        {coverageCount > 0 && (
          <Chip label={coverageCount} size="small" sx={{ height: 18, minWidth: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: theme.palette.background.paper, color: 'text.primary' }}/>
        )}
      </Box>
    </Paper>
  );
});
SubtechniqueCell.displayName = 'SubtechniqueCell';


const VirtualizedTechniqueList: React.FC<{
    tactic: MitreTactic;
    expandedTechniques: Set<string>;
    coverageData: TechniquesCoverageResponse | null;
    handleTechniqueSelect: (techniqueId: string, tacticId: string) => void;
    toggleTechniqueExpansion: (techniqueId: string) => void;
    getCellColor: (techniqueId: string) => string;
    getTextColor: (techniqueId: string) => string;
    theme: Theme;
    height: number;
    width: number;
}> = React.memo(({ tactic, expandedTechniques, coverageData, handleTechniqueSelect, toggleTechniqueExpansion, getCellColor, getTextColor, theme, height, width }) => {
    const items = useMemo(() => {
        const result: { type: 'technique' | 'subtechnique'; data: MitreTechnique; }[] = [];
        (tactic.techniques || []).forEach(technique => {
            result.push({ type: 'technique', data: technique });
            if (expandedTechniques.has(technique.id) && technique.subtechniques && technique.subtechniques.length > 0) {
                technique.subtechniques.forEach(subtechnique => {
                    result.push({ type: 'subtechnique', data: subtechnique });
                });
            }
        });
        return result;
    }, [tactic, expandedTechniques]);

    const getItemSize = useCallback((index: number) => items[index].type === 'technique' ? CELL_HEIGHT + 8 : SUBTECHNIQUE_CELL_HEIGHT + 8, [items]);

    if (items.length === 0) return <EmptyState title="No techniques match" description="Adjust filters or no active techniques in tactic." height={height - 20} />;

    return (
        <List height={height} width={width} itemCount={items.length} itemSize={getItemSize} overscanCount={5}>
            {({ index, style }: ListChildComponentProps) => {
                const item = items[index];
                if (item.type === 'technique') return (
                    <div style={{ ...style, padding: '4px 0' }}>
                        <TechniqueCell technique={item.data} tactic={tactic} expanded={expandedTechniques.has(item.data.id)} coverageData={coverageData} onExpand={toggleTechniqueExpansion} onSelect={handleTechniqueSelect} cellColor={getCellColor(item.data.id)} textColor={getTextColor(item.data.id)} theme={theme} />
                    </div>
                );
                return (
                    <div style={{ ...style, padding: '4px 0' }}>
                        <SubtechniqueCell subtechnique={item.data} tactic={tactic} coverageData={coverageData} onSelect={handleTechniqueSelect} cellColor={getCellColor(item.data.id)} textColor={getTextColor(item.data.id)} theme={theme} />
                    </div>
                );
            }}
        </List>
    );
});
VirtualizedTechniqueList.displayName = 'VirtualizedTechniqueList';

export default AttackMatrix;
