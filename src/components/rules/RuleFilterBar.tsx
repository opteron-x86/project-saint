// src/components/rules/RuleFilterBar.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Tooltip,
  Typography,
  Checkbox,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Badge,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DnsIcon from '@mui/icons-material/Dns';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';

import { RuleFilters, RuleSeverity, FilterOption } from '../../api/types';
import { SearchBar, FilterChip, ErrorDisplay } from '../common';
import { SEVERITY_DISPLAY, SEVERITY_COLORS } from '../../utils/constants';
import {
  useFilterStore,
  usePlatformOptions as useAttackPlatformOptions,
  useRulePlatformOptions,
  useTacticOptions,
  useRuleSourceOptions,
  useSeverityOptions,
  useIsLoadingOptions,
  useOptionsError,
} from '../../store/filterStore';

const RuleFilterBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filters = useFilterStore((state) => state.filters);
  const {
    setSearchTerm,
    setSeverities,
    setPlatforms,
    setTactics,
    setRuleSources,
    setRulePlatforms,
    clearFilters,
    fetchAllFilterOptions,
  } = useFilterStore();

  const attackPlatformOptions = useAttackPlatformOptions();
  const rulePlatformFilterOptions = useRulePlatformOptions();
  const tacticOptions = useTacticOptions();
  const ruleSourceOptions = useRuleSourceOptions();
  const severityOptions = useSeverityOptions();
  const isLoadingOptions = useIsLoadingOptions();
  const optionsError = useOptionsError();

  useEffect(() => {
    if (!isLoadingOptions && !optionsError && attackPlatformOptions.length === 0) {
      fetchAllFilterOptions();
    }
  }, [isLoadingOptions, optionsError, attackPlatformOptions.length, fetchAllFilterOptions]);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [severityAnchorEl, setSeverityAnchorEl] = useState<HTMLElement | null>(null);
  const [attackPlatformAnchorEl, setAttackPlatformAnchorEl] = useState<HTMLElement | null>(null);
  const [rulePlatformAnchorEl, setRulePlatformAnchorEl] = useState<HTMLElement | null>(null);
  const [ruleSourceAnchorEl, setRuleSourceAnchorEl] = useState<HTMLElement | null>(null);
  const [tacticsAnchorEl, setTacticsAnchorEl] = useState<HTMLElement | null>(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value || undefined);
  }, [setSearchTerm]);

  const handleSeverityChange = useCallback((severityValue: string) => {
    const currentSeverities = filters.severity || [];
    const newSeverities = currentSeverities.includes(severityValue as RuleSeverity)
      ? currentSeverities.filter((s) => s !== severityValue)
      : [...currentSeverities, severityValue as RuleSeverity];
    setSeverities(newSeverities);
  }, [filters.severity, setSeverities]);

  const handleAttackPlatformChange = useCallback((platformValue: string) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platformValue)
      ? currentPlatforms.filter((p) => p !== platformValue)
      : [...currentPlatforms, platformValue];
    setPlatforms(newPlatforms);
  }, [filters.platforms, setPlatforms]);

  const handleRulePlatformChange = useCallback((platformValue: string) => {
    const currentPlatforms = filters.rule_platform || [];
    const newPlatforms = currentPlatforms.includes(platformValue)
      ? currentPlatforms.filter((p) => p !== platformValue)
      : [...currentPlatforms, platformValue];
    setRulePlatforms(newPlatforms);
  }, [filters.rule_platform, setRulePlatforms]);

  const handleRuleSourceChange = useCallback((sourceValue: string) => {
    const currentSources = filters.rule_source || [];
    const newSources = currentSources.includes(sourceValue)
      ? currentSources.filter((s) => s !== sourceValue)
      : [...currentSources, sourceValue];
    setRuleSources(newSources);
  }, [filters.rule_source, setRuleSources]);

  const handleTacticChange = useCallback((tacticValue: string) => {
    const currentTactics = filters.tactics || [];
    const newTactics = currentTactics.includes(tacticValue)
      ? currentTactics.filter((t) => t !== tacticValue)
      : [...currentTactics, tacticValue];
    setTactics(newTactics);
  }, [filters.tactics, setTactics]);

  const handleRemoveFilter = useCallback((type: keyof RuleFilters, valueToRemove: string) => {
    switch (type) {
      case 'severity': setSeverities((filters.severity || []).filter((s) => s !== valueToRemove)); break;
      case 'platforms': setPlatforms((filters.platforms || []).filter((p) => p !== valueToRemove)); break;
      case 'rule_platform': setRulePlatforms((filters.rule_platform || []).filter((p) => p !== valueToRemove)); break;
      case 'rule_source': setRuleSources((filters.rule_source || []).filter((s) => s !== valueToRemove)); break;
      case 'tactics': setTactics((filters.tactics || []).filter((t) => t !== valueToRemove)); break;
      case 'search': setSearchTerm(undefined); break;
      default: break;
    }
  }, [filters, setSeverities, setPlatforms, setRulePlatforms, setRuleSources, setTactics, setSearchTerm]);

  const hasActiveFilters = useMemo(() =>
    (filters.search && filters.search.length > 0) ||
    (filters.severity && filters.severity.length > 0) ||
    (filters.platforms && filters.platforms.length > 0) ||
    (filters.rule_platform && filters.rule_platform.length > 0) ||
    (filters.rule_source && filters.rule_source.length > 0) ||
    (filters.tactics && filters.tactics.length > 0),
    [filters]
  );

  const renderCheckboxList = (
    options: FilterOption[],
    selectedValues: string[] | undefined,
    onChange: (value: string) => void,
    title: string,
    loading: boolean,
    error: unknown
  ) => {
    if (loading) {
      return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <ErrorDisplay message="Failed to load options" />
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={selectedValues?.includes(option.value) || false}
                  onChange={() => onChange(option.value)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{option.label}</Typography>
                  {option.count !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      ({option.count})
                    </Typography>
                  )}
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>
    );
  };

  const renderFilterChips = () => {
    const chips: React.ReactNode[] = [];
    
    if (filters.search) {
      chips.push(
        <FilterChip
          key="search"
          label={filters.search}
          category="Search"
          onClear={() => handleRemoveFilter('search', '')}
        />
      );
    }

    filters.severity?.forEach((severity) => {
      const severityInfo = SEVERITY_DISPLAY[severity as RuleSeverity];
      chips.push(
        <FilterChip
          key={`severity-${severity}`}
          label={severityInfo || severity}
          onClear={() => handleRemoveFilter('severity', severity)}
          customColor={SEVERITY_COLORS[severity as RuleSeverity]}
        />
      );
    });

    filters.platforms?.forEach((platform) => {
      chips.push(
        <FilterChip
          key={`platform-${platform}`}
          label={platform}
          category="ATT&CK Platform"
          onClear={() => handleRemoveFilter('platforms', platform)}
        />
      );
    });

    filters.rule_platform?.forEach((platform) => {
      chips.push(
        <FilterChip
          key={`rule-platform-${platform}`}
          label={platform}
          category="Rule Platform"
          onClear={() => handleRemoveFilter('rule_platform', platform)}
        />
      );
    });

    filters.rule_source?.forEach((source) => {
      chips.push(
        <FilterChip
          key={`source-${source}`}
          label={source}
          category="Source"
          onClear={() => handleRemoveFilter('rule_source', source)}
        />
      );
    });

    filters.tactics?.forEach((tactic) => {
      chips.push(
        <FilterChip
          key={`tactic-${tactic}`}
          label={tactic}
          category="Tactic"
          onClear={() => handleRemoveFilter('tactics', tactic)}
        />
      );
    });

    return chips;
  };

  const severityPopoverId = severityAnchorEl ? 'severity-popover' : undefined;
  const attackPlatformPopoverId = attackPlatformAnchorEl ? 'attack-platform-popover' : undefined;
  const rulePlatformPopoverId = rulePlatformAnchorEl ? 'rule-platform-popover' : undefined;
  const ruleSourcePopoverId = ruleSourceAnchorEl ? 'rule-source-popover' : undefined;
  const tacticsPopoverId = tacticsAnchorEl ? 'tactics-popover' : undefined;
  const moreMenuId = moreMenuAnchorEl ? 'more-menu' : undefined;

  return (
    <Box sx={{ mb: 2 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 1.5,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar
            placeholder="Search rules by name, ID, description..."
            initialValue={filters.search || ''}
            onSearch={handleSearchChange}
            sx={{ 
              flex: '1 1 300px',
              minWidth: 200,
            }}
          />
          
          {!isMobile && (
            <>
              <Badge 
                badgeContent={filters.severity?.length || 0} 
                color="primary"
                invisible={!filters.severity || filters.severity.length === 0}
              >
                <Button 
                  variant={filters.severity && filters.severity.length > 0 ? "contained" : "outlined"}
                  size="small" 
                  startIcon={<WarningAmberIcon />} 
                  onClick={(e) => setSeverityAnchorEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  Severity
                </Button>
              </Badge>

              <Badge 
                badgeContent={filters.platforms?.length || 0} 
                color="primary"
                invisible={!filters.platforms || filters.platforms.length === 0}
              >
                <Button 
                  variant={filters.platforms && filters.platforms.length > 0 ? "contained" : "outlined"}
                  size="small" 
                  startIcon={<SecurityIcon />} 
                  onClick={(e) => setAttackPlatformAnchorEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  ATT&CK Platform
                </Button>
              </Badge>

              <Badge 
                badgeContent={filters.rule_platform?.length || 0} 
                color="primary"
                invisible={!filters.rule_platform || filters.rule_platform.length === 0}
              >
                <Button 
                  variant={filters.rule_platform && filters.rule_platform.length > 0 ? "contained" : "outlined"}
                  size="small" 
                  startIcon={<DnsIcon />} 
                  onClick={(e) => setRulePlatformAnchorEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  Rule Platform
                </Button>
              </Badge>
            </>
          )}
          
          {isMobile && (
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<FilterListIcon />} 
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Filters
              {hasActiveFilters && ` (${renderFilterChips().length})`}
            </Button>
          )}
          
          <Tooltip title="More filters">
            <IconButton 
              size="small" 
              onClick={(e) => setMoreMenuAnchorEl(e.currentTarget)}
              color={(filters.tactics && filters.tactics.length > 0) || (filters.rule_source && filters.rule_source.length > 0) ? 'primary' : 'default'}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          {hasActiveFilters && (
            <Button 
              variant="text" 
              size="small" 
              color="error" 
              onClick={clearFilters} 
              startIcon={<ClearIcon />}
              sx={{ ml: 'auto', textTransform: 'none' }}
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <Box 
            sx={{ 
              mt: 1.5, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              alignItems: 'center'
            }}
          >
            {renderFilterChips()}
          </Box>
        )}
      </Paper>

      {/* Popovers */}
      <Popover 
        id={severityPopoverId} 
        open={Boolean(severityAnchorEl)} 
        anchorEl={severityAnchorEl} 
        onClose={() => setSeverityAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {renderCheckboxList(severityOptions, filters.severity, handleSeverityChange, "Filter by Severity", isLoadingOptions, optionsError)}
      </Popover>

      <Popover 
        id={attackPlatformPopoverId} 
        open={Boolean(attackPlatformAnchorEl)} 
        anchorEl={attackPlatformAnchorEl} 
        onClose={() => setAttackPlatformAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {renderCheckboxList(attackPlatformOptions, filters.platforms, handleAttackPlatformChange, "Filter by ATT&CK Platform", isLoadingOptions, optionsError)}
      </Popover>

      <Popover 
        id={rulePlatformPopoverId} 
        open={Boolean(rulePlatformAnchorEl)} 
        anchorEl={rulePlatformAnchorEl} 
        onClose={() => setRulePlatformAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {renderCheckboxList(rulePlatformFilterOptions, filters.rule_platform, handleRulePlatformChange, "Filter by Rule Platform", isLoadingOptions, optionsError)}
      </Popover>

      <Popover 
        id={tacticsPopoverId} 
        open={Boolean(tacticsAnchorEl)} 
        anchorEl={tacticsAnchorEl} 
        onClose={() => setTacticsAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { width: 320 } }}
      >
        {renderCheckboxList(tacticOptions, filters.tactics, handleTacticChange, "Filter by MITRE ATT&CK Tactic", isLoadingOptions, optionsError)}
      </Popover>

      <Popover 
        id={ruleSourcePopoverId} 
        open={Boolean(ruleSourceAnchorEl)} 
        anchorEl={ruleSourceAnchorEl} 
        onClose={() => setRuleSourceAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {renderCheckboxList(ruleSourceOptions, filters.rule_source, handleRuleSourceChange, "Filter by Source", isLoadingOptions, optionsError)}
      </Popover>

      {/* More Menu */}
      <Menu 
        id={moreMenuId} 
        anchorEl={moreMenuAnchorEl} 
        open={Boolean(moreMenuAnchorEl)} 
        onClose={() => setMoreMenuAnchorEl(null)}
        MenuListProps={{ dense: true }}
      >
        <MenuItem 
          onClick={(e) => { 
            setMoreMenuAnchorEl(null); 
            setTacticsAnchorEl(e.currentTarget as HTMLElement); 
          }}
        >
          MITRE ATT&CK Tactics
        </MenuItem>
        <MenuItem 
          onClick={(e) => { 
            setMoreMenuAnchorEl(null); 
            setRuleSourceAnchorEl(e.currentTarget as HTMLElement); 
          }}
        >
          Rule Source
        </MenuItem>
        {isMobile && (
          <>
            <Divider />
            <MenuItem 
              onClick={(e) => { 
                setMoreMenuAnchorEl(null); 
                setSeverityAnchorEl(e.currentTarget as HTMLElement); 
              }}
            >
              Severity
            </MenuItem>
            <MenuItem 
              onClick={(e) => { 
                setMoreMenuAnchorEl(null); 
                setAttackPlatformAnchorEl(e.currentTarget as HTMLElement); 
              }}
            >
              ATT&CK Platform
            </MenuItem>
            <MenuItem 
              onClick={(e) => { 
                setMoreMenuAnchorEl(null); 
                setRulePlatformAnchorEl(e.currentTarget as HTMLElement); 
              }}
            >
              Rule Platform
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="right" 
        open={filterDrawerOpen} 
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { width: '80%', maxWidth: 360 } }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: `1px solid ${theme.palette.divider}` 
          }}
        >
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {renderCheckboxList(severityOptions, filters.severity, handleSeverityChange, "Severity", isLoadingOptions, optionsError)}
          <Divider />
          {renderCheckboxList(attackPlatformOptions, filters.platforms, handleAttackPlatformChange, "ATT&CK Platform", isLoadingOptions, optionsError)}
          <Divider />
          {renderCheckboxList(rulePlatformFilterOptions, filters.rule_platform, handleRulePlatformChange, "Rule Platform", isLoadingOptions, optionsError)}
          <Divider />
          {renderCheckboxList(ruleSourceOptions, filters.rule_source, handleRuleSourceChange, "Source", isLoadingOptions, optionsError)}
          <Divider />
          {renderCheckboxList(tacticOptions, filters.tactics, handleTacticChange, "MITRE ATT&CK Tactic", isLoadingOptions, optionsError)}
        </Box>
        
        <Box 
          sx={{ 
            p: 2, 
            mt: 'auto', 
            borderTop: `1px solid ${theme.palette.divider}`, 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}
        >
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => { 
              clearFilters(); 
              setFilterDrawerOpen(false);
            }} 
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default RuleFilterBar;