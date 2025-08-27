// src/pages/AttackMatrix/AttackMatrix.tsx - Simplified technique details

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Drawer,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import { Theme } from '@mui/material/styles';

import { SearchBar, EmptyState, LoadingIndicator, ErrorDisplay } from '@/components/common';
import {
  useFilterStore,
  usePlatformOptions as useAttackPlatformOptions,
  useIsLoadingOptions,
  useOptionsError as useFilterOptionsError,
} from '@/store';
import {
  MitreTactic,
  MitreTechnique,
  FilterOption,
} from '@/api/types';
import { useMitreAttackData } from '@/hooks/data/useMitreAttackData';

// Constants
const HEADER_HEIGHT = 120;
const CELL_HEIGHT = 80;
const SUBTECHNIQUE_CELL_HEIGHT = 60;
const CELL_MIN_WIDTH = 220;

const TACTIC_ORDER = [
  'TA0043', 'TA0042', 'TA0001', 'TA0002', 'TA0003', 'TA0004', 'TA0005',
  'TA0006', 'TA0007', 'TA0008', 'TA0009', 'TA0011', 'TA0010', 'TA0040',
];

const AttackMatrix: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { filters, setPlatforms, fetchAllFilterOptions } = useFilterStore();
  const attackPlatformOptions: FilterOption[] = useAttackPlatformOptions();
  const isLoadingPlatformOptions = useIsLoadingOptions();
  const platformOptionsError = useFilterOptionsError();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContentMode, setDrawerContentMode] = useState<'tactic' | 'technique'>('technique');
  const [selectedTacticId, setSelectedTacticId] = useState<string | null>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set());
  const [platformFilterAnchorEl, setPlatformFilterAnchorEl] = useState<null | HTMLElement>(null);

  const { 
    matrix: rawMatrixData, 
    coverageMap,
    isLoading: isLoadingMatrixAndCoverage, 
    isError: isErrorMatrixAndCoverage, 
    error: errorMatrixAndCoverage,
    refetch: refetchMatrixData
  } = useMitreAttackData(filters.platforms && filters.platforms.length > 0 ? filters.platforms[0] : null);

  useEffect(() => {
    if (!isLoadingPlatformOptions && !platformOptionsError && attackPlatformOptions.length === 0) {
      fetchAllFilterOptions();
    }
  }, [fetchAllFilterOptions, isLoadingPlatformOptions, platformOptionsError, attackPlatformOptions.length]);

  const filteredAndSortedMatrix = useMemo((): MitreTactic[] | null => {
    if (!rawMatrixData) return null;
    const searchLower = searchTerm.toLowerCase().trim();
    const hasPlatformFilter = (filters.platforms || []).length > 0;
    
    const techniqueMatches = (tech: MitreTechnique) => {
      const platformMatch = !hasPlatformFilter || 
        (tech.platforms || []).some(p => (filters.platforms || []).includes(p));
      const searchMatch = !searchLower || 
        tech.name?.toLowerCase().includes(searchLower) || 
        tech.technique_id?.toLowerCase().includes(searchLower);
      return platformMatch && searchMatch;
    };
    
    const sortedTactics = [...rawMatrixData].sort((a, b) => {
      const aIndex = TACTIC_ORDER.indexOf(a.tactic_id || '');
      const bIndex = TACTIC_ORDER.indexOf(b.tactic_id || '');
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    return sortedTactics.map(tactic => ({
      ...tactic,
      techniques: (tactic.techniques || []).map(tech => ({
        ...tech,
        subtechniques: (tech.subtechniques || []).filter(techniqueMatches)
      })).filter(tech => techniqueMatches(tech) || (tech.subtechniques || []).length > 0)
    })).filter(tactic => tactic.techniques.length > 0);
  }, [rawMatrixData, searchTerm, filters.platforms]);

  const selectedTactic = useMemo(() => 
    (rawMatrixData || []).find(t => t.tactic_id === selectedTacticId) || null, 
    [rawMatrixData, selectedTacticId]
  );
  
  const selectedTechnique = useMemo(() => {
    if (!selectedTechniqueId || !rawMatrixData) return null;
    for (const tactic of rawMatrixData) {
      for (const technique of tactic.techniques) {
        if (technique.technique_id === selectedTechniqueId) return technique;
        if (technique.subtechniques) {
          for (const subtechnique of technique.subtechniques) {
            if (subtechnique.technique_id === selectedTechniqueId) return subtechnique;
          }
        }
      }
    }
    return null;
  }, [rawMatrixData, selectedTechniqueId]);

  const handleTechniqueSelect = useCallback((techniqueId: string, tacticId: string) => {
    setSelectedTechniqueId(techniqueId);
    setSelectedTacticId(tacticId);
    setDrawerContentMode('technique');
    setDrawerOpen(true);
  }, []);

  const handleTacticSelect = useCallback((tacticId: string) => {
    setSelectedTacticId(tacticId);
    setSelectedTechniqueId(null);
    setDrawerContentMode('tactic');
    setDrawerOpen(true);
  }, []);

  const handleViewRules = useCallback((techniqueId: string) => {
    navigate(`/rules?mitre=${techniqueId}`);
  }, [navigate]);

  const getCellColor = useCallback((techniqueId: string): string => {
    const coverage = coverageMap?.get(techniqueId);
    const count = coverage?.count || 0;
    
    if (count === 0) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[200], 0.5);
    if (count < 10) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.info.dark, 0.5) : alpha(theme.palette.info.light, 0.6);
    if (count < 50) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.info.main, 0.6) : alpha(theme.palette.info.main, 0.5);
    if (count < 100) return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.warning.main, 0.6) : alpha(theme.palette.warning.light, 0.6);
    return theme.palette.mode === 'dark' ? 
      alpha(theme.palette.success.main, 0.6) : alpha(theme.palette.success.light, 0.6);
  }, [coverageMap, theme]);

  const getTextColor = useCallback((techniqueId: string): string => {
    const coverage = coverageMap?.get(techniqueId);
    const count = coverage?.count || 0;
    return count >= 100 ? theme.palette.common.white : theme.palette.text.primary;
  }, [coverageMap, theme]);

  const toggleTechniqueExpansion = useCallback((techniqueId: string) => {
    setExpandedTechniques(prev => {
      const newSet = new Set(prev);
      if (newSet.has(techniqueId)) {
        newSet.delete(techniqueId);
      } else {
        newSet.add(techniqueId);
      }
      return newSet;
    });
  }, []);

  const isLoadingDisplay = isLoadingMatrixAndCoverage || isLoadingPlatformOptions;
  const displayTactics = filteredAndSortedMatrix || [];

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
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 200px)', 
        overflow: 'auto',
        position: 'relative' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          minWidth: 'fit-content',
          height: '100%'
        }}>
          {displayTactics.map(tactic => (
            <Box key={tactic.tactic_id} sx={{ minWidth: CELL_MIN_WIDTH, flex: '0 0 auto' }}>
              <TacticHeader tactic={tactic} onSelect={handleTacticSelect} theme={theme} />
              <Box sx={{ overflowY: 'auto', height: 'calc(100% - ' + HEADER_HEIGHT + 'px)' }}>
                {tactic.techniques.map(technique => (
                  <Box key={technique.technique_id}>
                    <TechniqueCell
                      technique={technique}
                      tactic={tactic}
                      expanded={expandedTechniques.has(technique.technique_id || '')}
                      coverageMap={coverageMap}
                      onExpand={() => toggleTechniqueExpansion(technique.technique_id || '')}
                      onSelect={handleTechniqueSelect}
                      cellColor={getCellColor(technique.technique_id || '')}
                      textColor={getTextColor(technique.technique_id || '')}
                      theme={theme}
                    />
                    {expandedTechniques.has(technique.technique_id || '') && technique.subtechniques?.map(subtech => (
                      <SubtechniqueCell
                        key={subtech.technique_id}
                        subtechnique={subtech}
                        parentTechnique={technique}
                        tactic={tactic}
                        coverageMap={coverageMap}
                        onSelect={handleTechniqueSelect}
                        cellColor={getCellColor(subtech.technique_id || '')}
                        textColor={getTextColor(subtech.technique_id || '')}
                        theme={theme}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search techniques..."
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setPlatformFilterAnchorEl(e.currentTarget)}
          >
            Platforms {filters.platforms?.length ? `(${filters.platforms.length})` : ''}
          </Button>
          <IconButton onClick={refetchMatrixData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {renderMatrixContent()}

      {/* Technique Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', md: 600 } } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {drawerContentMode === 'technique' && selectedTechnique ? (
                  <>
                    {selectedTechnique.technique_id}: {selectedTechnique.name}
                  </>
                ) : drawerContentMode === 'tactic' && selectedTactic ? (
                  <>
                    {selectedTactic.tactic_id}: {selectedTactic.name}
                  </>
                ) : (
                  'Details'
                )}
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {drawerContentMode === 'technique' && selectedTechnique && (
              <>
                {/* Coverage Summary */}
                {coverageMap?.get(selectedTechnique.technique_id || '') && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Detection Coverage
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {coverageMap.get(selectedTechnique.technique_id || '')?.count || 0} rules
                    </Typography>
                  </Paper>
                )}

                {/* Technique Details */}
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" paragraph sx={{ mb: 3 }}>
                  {selectedTechnique.description || 'No description available.'}
                </Typography>

                {/* Platforms */}
                {selectedTechnique.platforms && selectedTechnique.platforms.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Platforms
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedTechnique.platforms.map(p => (
                        <Chip key={p} label={p} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Data Sources */}
                {selectedTechnique.data_sources && selectedTechnique.data_sources.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Data Sources
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedTechnique.data_sources.map(ds => (
                        <Chip key={ds} label={ds} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SearchIcon />}
                    onClick={() => handleViewRules(selectedTechnique.technique_id || '')}
                  >
                    View Detection Rules
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    href={`https://attack.mitre.org/techniques/${selectedTechnique.technique_id?.replace('.', '/')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                  >
                    View on MITRE ATT&CK
                  </Button>
                </Box>
              </>
            )}

            {drawerContentMode === 'tactic' && selectedTactic && (
              <>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedTactic.description || 'No description available.'}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Statistics
                </Typography>
                <Typography variant="body2">
                  • {selectedTactic.techniques.length} techniques in this tactic
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Platform Filter Popover */}
      <Popover
        open={Boolean(platformFilterAnchorEl)}
        anchorEl={platformFilterAnchorEl}
        onClose={() => setPlatformFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by Platform
          </Typography>
          <FormGroup>
            {attackPlatformOptions.map(platform => (
              <FormControlLabel
                key={platform.value}
                control={
                  <Checkbox
                    checked={(filters.platforms || []).includes(platform.value)}
                    onChange={() => {
                      const newPlatforms = (filters.platforms || []).includes(platform.value)
                        ? (filters.platforms || []).filter(p => p !== platform.value)
                        : [...(filters.platforms || []), platform.value];
                      setPlatforms(newPlatforms);
                    }}
                  />
                }
                label={`${platform.label} (${platform.count || 0})`}
              />
            ))}
          </FormGroup>
          {filters.platforms && filters.platforms.length > 0 && (
            <Button
              size="small"
              onClick={() => setPlatforms([])}
              sx={{ mt: 1 }}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

// Component definitions remain the same
const TacticHeader: React.FC<{
  tactic: MitreTactic;
  onSelect: (tacticId: string) => void;
  theme: Theme;
}> = React.memo(({ tactic, onSelect, theme }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        height: HEADER_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        '&:hover': {
          bgcolor: theme.palette.primary.dark,
        },
      }}
      onClick={() => onSelect(tactic.tactic_id || '')}
    >
      <Typography variant="subtitle1" fontWeight={600} align="center">
        {tactic.name}
      </Typography>
      <Typography variant="caption" align="center">
        {tactic.tactic_id}
      </Typography>
      <Typography variant="caption" align="center" sx={{ mt: 0.5 }}>
        {tactic.techniques.length} techniques
      </Typography>
    </Paper>
  );
});

const TechniqueCell: React.FC<{
  technique: MitreTechnique;
  tactic: MitreTactic;
  expanded: boolean;
  coverageMap: Map<string, any> | undefined;
  onExpand: () => void;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ technique, tactic, expanded, coverageMap, onExpand, onSelect, cellColor, textColor, theme }) => {
  const hasSubtechniques = technique.subtechniques && technique.subtechniques.length > 0;
  const coverage = coverageMap?.get(technique.technique_id || '');
  const coverageCount = coverage?.count || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: CELL_HEIGHT,
        m: 0.5,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: cellColor,
        color: textColor,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 2,
        },
      }}
      onClick={() => onSelect(technique.technique_id || '', tactic.tactic_id || '')}
    >
      <Box>
        <Typography variant="caption" fontWeight={600}>
          {technique.technique_id}
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
          {technique.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        {coverageCount > 0 && (
          <Chip
            label={coverageCount}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 'bold',
              bgcolor: alpha(theme.palette.common.white, 0.9),
              color: theme.palette.text.primary,
            }}
          />
        )}
        {hasSubtechniques && (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onExpand(); }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
    </Paper>
  );
});

const SubtechniqueCell: React.FC<{
  subtechnique: MitreTechnique;
  parentTechnique: MitreTechnique;
  tactic: MitreTactic;
  coverageMap: Map<string, any> | undefined;
  onSelect: (techniqueId: string, tacticId: string) => void;
  cellColor: string;
  textColor: string;
  theme: Theme;
}> = React.memo(({ subtechnique, tactic, coverageMap, onSelect, cellColor, textColor, theme }) => {
  const coverage = coverageMap?.get(subtechnique.technique_id || '');
  const coverageCount = coverage?.count || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: SUBTECHNIQUE_CELL_HEIGHT,
        m: 0.5,
        ml: 2,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: cellColor,
        color: textColor,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        cursor: 'pointer',
        fontSize: '0.75rem',
        '&:hover': {
          transform: 'translateX(2px)',
          boxShadow: 1,
        },
      }}
      onClick={() => onSelect(subtechnique.technique_id || '', tactic.tactic_id || '')}
    >
      <Box>
        <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem' }}>
          {subtechnique.technique_id}
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.62rem', mt: 0.25 }}>
          {subtechnique.name}
        </Typography>
      </Box>
      {coverageCount > 0 && (
        <Chip
          label={coverageCount}
          size="small"
          sx={{
            height: 16,
            fontSize: '0.6rem',
            fontWeight: 'bold',
            bgcolor: alpha(theme.palette.common.white, 0.9),
            color: theme.palette.text.primary,
          }}
        />
      )}
    </Paper>
  );
});

TacticHeader.displayName = 'TacticHeader';
TechniqueCell.displayName = 'TechniqueCell';
SubtechniqueCell.displayName = 'SubtechniqueCell';

export default AttackMatrix;