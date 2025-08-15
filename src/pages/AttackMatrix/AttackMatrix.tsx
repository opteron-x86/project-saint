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
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Theme } from '@mui/material/styles';

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

    FilterOption,
    TechniqueRuleInfo,
} from '@/api/types';
import { useMitreAttackData } from '@/hooks/data/useMitreAttackData';
import { useRuleQuery } from '@/api/queries';

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

  // Updated hook usage with coverageMap
  const { 
    matrix: rawMatrixData, 
    coverageMap,
    isLoading: isLoadingMatrixAndCoverage, 
    isError: isErrorMatrixAndCoverage, 
    error: errorMatrixAndCoverage,
    refetch: refetchMatrixData
  } = useMitreAttackData(filters.platforms && filters.platforms.length > 0 ? filters.platforms[0] : null);

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

  const selectedTactic = useMemo(() => 
    (rawMatrixData || []).find(t => t.id === selectedTacticId) || null, 
    [rawMatrixData, selectedTacticId]
  );
  
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
    setExpandedTechniques(prev => { 
      const newSet = new Set(prev); 
      newSet.has(techniqueId) ? newSet.delete(techniqueId) : newSet.add(techniqueId);
      return newSet; 
    });
  }, []);

  const handleTacticSelect = useCallback((tacticId: string) => {
    setSelectedTacticId(tacticId);
    setSelectedTechniqueId(null);
    setSelectedRuleId(null);
    setDrawerContentMode('tactic');
    setDrawerOpen(true);
    setTabValue(0);
    setHistoryStack([]);
  }, []);

  const handleTechniqueSelect = useCallback((techniqueId: string, tacticId: string) => {
    const prevState: DrawerHistoryState = { 
      mode: drawerContentMode, 
      tacticId: selectedTacticId, 
      techniqueId: selectedTechniqueId, 
      tab: tabValue 
    };
    setHistoryStack(prev => [...prev, prevState]);
    setSelectedTacticId(tacticId);
    setSelectedTechniqueId(techniqueId);
    setSelectedRuleId(null);
    setDrawerContentMode('technique');
    setDrawerOpen(true);
    setTabValue(0);
  }, [drawerContentMode, selectedTacticId, selectedTechniqueId, tabValue]);

  const handleRuleSelect = useCallback((rule: TechniqueRuleInfo) => {
    const prevState: DrawerHistoryState = { 
      mode: drawerContentMode, 
      tacticId: selectedTacticId, 
      techniqueId: selectedTechniqueId, 
      tab: tabValue 
    };
    setHistoryStack(prev => [...prev, prevState]);
    setSelectedRuleId(rule.id);
    setDrawerContentMode('rule');
    setTabValue(0);
  }, [drawerContentMode, selectedTacticId, selectedTechniqueId, tabValue]);

  const handleBack = useCallback(() => {
    if (historyStack.length > 0) {
      const prevState = historyStack[historyStack.length - 1];
      setDrawerContentMode(prevState.mode);
      setSelectedTacticId(prevState.tacticId);
      setSelectedTechniqueId(prevState.techniqueId);
      setTabValue(prevState.tab);
      if (prevState.mode !== 'rule') setSelectedRuleId(null);
      setHistoryStack(prev => prev.slice(0, -1));
    }
  }, [historyStack]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedTacticId(null);
      setSelectedTechniqueId(null);
      setSelectedRuleId(null);
      setHistoryStack([]);
    }, 300);
  }, []);

  // Updated to use coverageMap
  const getCellColor = useCallback((techniqueId: string): string => {
    const coverage = coverageMap?.get(techniqueId);
    const count = coverage?.count || 0;
    
    if (count === 0) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[200], 0.5);
    if (count < 5) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.info.dark, 0.5) : alpha(theme.palette.info.light, 0.6);
    if (count < 10) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.info.main, 0.6) : alpha(theme.palette.info.main, 0.5);
    return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.info.main, 0.8) : alpha(theme.palette.info.main, 0.7);
  }, [coverageMap, theme]);

  const getTextColor = useCallback((techniqueId: string): string => {
    const coverage = coverageMap?.get(techniqueId);
    const count = coverage?.count || 0;
    return count >= 10 ? theme.palette.info.contrastText : theme.palette.text.primary;
  }, [coverageMap, theme]);

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
      return <ErrorDisplay 
        message="Failed to load ATT&CK matrix" 
        details={String(errorMatrixAndCoverage)} 
        retry 
        onRetry={refetchMatrixData}
      />;
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
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', overflowY: 'auto', overflowX: 'auto' }}>
              {displayTactics.map((tactic: MitreTactic) => (
                <Box key={tactic.id} sx={{ flex: `0 0 ${CELL_MIN_WIDTH}px`, minWidth: CELL_MIN_WIDTH, maxWidth: CELL_MIN_WIDTH, p: 0.5, mr: isMobile ? 0.5 : 1 }}>
                  {tactic.techniques.map((technique: MitreTechnique) => (
                    <Box key={technique.id} sx={{ mb: 1 }}>
                      <TechniqueCell
                        technique={technique}
                        tactic={tactic}
                        expanded={expandedTechniques.has(technique.id)}
                        coverageMap={coverageMap}
                        onExpand={toggleTechniqueExpansion}
                        onSelect={handleTechniqueSelect}
                        cellColor={getCellColor(technique.id)}
                        textColor={getTextColor(technique.id)}
                        theme={theme}
                      />
                      {expandedTechniques.has(technique.id) && technique.subtechniques && technique.subtechniques.length > 0 && (
                        <Box sx={{ ml: SUBTECHNIQUE_INDENT / 8, mt: 0.5 }}>
                          {technique.subtechniques.filter(st => !st.is_deprecated).map((subtech: MitreTechnique) => (
                            <Box key={subtech.id} sx={{ mb: 0.5 }}>
                              <SubtechniqueCell
                                subtechnique={subtech}
                                parentTechnique={technique}
                                tactic={tactic}
                                coverageMap={coverageMap}
                                onSelect={handleTechniqueSelect}
                                cellColor={getCellColor(subtech.id)}
                                textColor={getTextColor(subtech.id)}
                                theme={theme}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </AutoSizer>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header Controls */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2 }}>
     
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* TODO: Fix SearchBar props interface
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search techniques..."
            sx={{ flex: '1 1 300px', maxWidth: 400 }}
          />
          */}
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handlePlatformFilterOpen}
              sx={{ minWidth: 120 }}
            >
              Platforms {filters.platforms && filters.platforms.length > 0 && `(${filters.platforms.length})`}
            </Button>
            
            {(filters.platforms || []).length > 0 && (
              <Button size="small" onClick={clearPlatformFilters}>
                Clear
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={refetchMatrixData} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Matrix Grid */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {renderMatrixContent()}
      </Box>

      {/* Platform Filter Popover */}
      <Popover
        open={Boolean(platformFilterAnchorEl)}
        anchorEl={platformFilterAnchorEl}
        onClose={handlePlatformFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by Platform
          </Typography>
          <FormGroup>
            {attackPlatformOptions.map((platform) => (
              <FormControlLabel
                key={platform.value}
                control={
                  <Checkbox
                    size="small"
                    checked={(filters.platforms || []).includes(platform.value)}
                    onChange={() => handlePlatformSelectionChange(platform.value)}
                  />
                }
                label={platform.label}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 500,
            bgcolor: 'background.paper',
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Drawer Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {historyStack.length > 0 && (
                <IconButton onClick={handleBack} size="small">
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h6">
                {drawerContentMode === 'rule' ? 'Rule Details' :
                 drawerContentMode === 'technique' ? selectedTechnique?.name || 'Technique' :
                 selectedTactic?.name || 'Tactic'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Drawer Content */}
          {drawerContentMode === 'rule' ? (
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {isLoadingFullRuleDetail ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : isErrorFullRuleDetail ? (
                <ErrorDisplay
                  message="Failed to load rule details"
                  details={String(errorFullRuleDetail)}
                  retry
                  onRetry={() => refetchFullRuleDetail()}
                />
              ) : fetchedFullRuleDetail ? (
                <Suspense fallback={<CircularProgress />}>
                  <LazyRuleDetail rule={fetchedFullRuleDetail} onClose={handleBack} />
                </Suspense>
              ) : (
                <EmptyState title="No Rule Selected" description="Select a rule to view details." height={150} />
              )}
            </Box>
          ) : (
            <>
              {/* Tabs for Tactic/Technique view */}
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Overview" />
                <Tab label="Rules" />
              </Tabs>
              
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {tabValue === 0 && (
                  <>
                    {drawerContentMode === 'technique' && selectedTechnique ? (
                      <>
                        <Typography variant="body2" paragraph>
                          <strong>ID:</strong> {selectedTechnique.id}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Description:</strong> {selectedTechnique.description || 'No description available.'}
                        </Typography>
                        {selectedTechnique.platforms && selectedTechnique.platforms.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={500} gutterBottom>
                              Platforms:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {selectedTechnique.platforms.map(p => (
                                <Chip key={p} label={p} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {buttonHref ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            href={buttonHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<InfoOutlinedIcon />}
                            sx={{ mt: 1.5 }}
                          >
                            View on MITRE ATT&CK
                          </Button>
                        ) : null}
                      </>
                    ) : drawerContentMode === 'tactic' && selectedTactic ? (
                      <>
                        <Typography variant="body2" paragraph>
                          <strong>ID:</strong> {selectedTactic.id}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Description:</strong> {selectedTactic.description || 'No description available.'}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Techniques:</strong> {selectedTactic.techniques.length}
                        </Typography>
                        {buttonHref ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            href={buttonHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<InfoOutlinedIcon />}
                            sx={{ mt: 1.5 }}
                          >
                            View on MITRE ATT&CK
                          </Button>
                        ) : null}
                      </>
                    ) : null}
                  </>
                )}
                {tabValue === 1 && (
                  (selectedTechniqueId && coverageMap) ? (() => {
                    const techCoverage = coverageMap.get(selectedTechniqueId);
                    if (!techCoverage || techCoverage.rules.length === 0) {
                      return <EmptyState 
                        title="No Rules Found" 
                        description={`No rules associated with ${selectedTechnique?.name || ''}.`} 
                        height={150}
                      />
                    }
                    return (
                      <Box sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', pr:0.5}}>
                        {techCoverage.rules.map((rule: TechniqueRuleInfo) => ( 
                          <Paper 
                            key={rule.id} 
                            elevation={0} 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              cursor:'pointer', 
                              '&:hover': {bgcolor: 'action.hover'}
                            }} 
                            onClick={() => handleRuleSelect(rule)}
                          >
                            <Typography variant="subtitle2" fontWeight={500}>
                              {rule.title}
                            </Typography>
                            <Box sx={{
                              display:'flex', 
                              justifyContent:'space-between', 
                              alignItems:'center', 
                              mt:0.5
                            }}>
                              <Chip 
                                label={rule.id} 
                                size="small" 
                                sx={{fontSize:'0.7rem', fontFamily:'monospace'}} 
                                variant="outlined"
                              />
                              <StatusBadge 
                                label={rule.severity} 
                                status={rule.severity.toLowerCase()} 
                                size="small"
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    );
                  })() : <EmptyState 
                    title="No Technique Selected" 
                    description="Select a technique to view its associated rules." 
                    height={150}
                  />
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
  coverageMap: Map<string, any> | undefined;
  onExpand: (techniqueId: string) => void;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ technique, tactic, expanded, coverageMap, onExpand, onSelect, cellColor, textColor, theme }) => {
  const hasSubtechniques = technique.subtechniques && technique.subtechniques.length > 0 && 
    technique.subtechniques.some(st => !st.is_deprecated);
  const techniqueCoverage = coverageMap?.get(technique.id);
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
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
      }}
      onClick={() => onSelect(technique.id, tactic.id)}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="caption" fontWeight={600} align="center" sx={{ lineHeight: 1.2 }}>
          {technique.id}
        </Typography>
        <Typography variant="caption" align="center" sx={{ lineHeight: 1.2, mt: 0.5, fontSize: '0.68rem' }}>
          {technique.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
        {coverageCount > 0 && (
          <Chip label={coverageCount} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }} />
        )}
        {hasSubtechniques && (
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onExpand(technique.id);
          }} sx={{ p: 0.25 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
    </Paper>
  );
});
TechniqueCell.displayName = 'TechniqueCell';

const SubtechniqueCell: React.FC<{
  subtechnique: MitreTechnique;
  parentTechnique: MitreTechnique;
  tactic: MitreTactic;
  coverageMap: Map<string, any> | undefined;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ subtechnique, parentTechnique, tactic, coverageMap, onSelect, cellColor, textColor, theme }) => {
  const subtechniqueCoverage = coverageMap?.get(subtechnique.id);
  const coverageCount = subtechniqueCoverage?.count || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: SUBTECHNIQUE_CELL_HEIGHT, width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px',
        bgcolor: cellColor, color: textColor, border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1, cursor: 'pointer', fontSize: '0.75rem',
        transition: theme.transitions.create(['transform', 'box-shadow'], { duration: theme.transitions.duration.shortest }),
        '&:hover': { transform: 'translateX(2px)', boxShadow: 1 },
      }}
      onClick={() => onSelect(subtechnique.id, tactic.id)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
          {subtechnique.id}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.62rem', lineHeight: 1.2, mt: 0.25 }}>
          {subtechnique.name}
        </Typography>
      </Box>
      {coverageCount > 0 && (
        <Chip label={coverageCount} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />
      )}
    </Paper>
  );
});
SubtechniqueCell.displayName = 'SubtechniqueCell';

export default AttackMatrix;