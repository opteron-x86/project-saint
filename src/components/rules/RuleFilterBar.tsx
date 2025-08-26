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
  Paper,
  Typography,
  Checkbox,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Badge,
  Chip,
  Stack,
  alpha,
  Collapse,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { RuleFilters, RuleSeverity, FilterOption } from '../../api/types';
import { FilterChip, ErrorDisplay } from '../common';
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

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  options: FilterOption[];
  selectedValues: string[] | undefined;
  onChange: (value: string) => void;
  loading?: boolean;
  colorMap?: Record<string, string>;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  options,
  selectedValues,
  onChange,
  loading,
  colorMap,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
          minHeight: 48,
          padding: '0 16px',
          '&.Mui-expanded': { minHeight: 48 },
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
        sx={{
          '& .MuiAccordionSummary-content': {
            margin: '8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
          {selectedValues && selectedValues.length > 0 && (
            <Chip
              label={selectedValues.length}
              size="small"
              color="primary"
              sx={{ height: 20, minWidth: 28 }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2 }}>
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={selectedValues?.includes(option.value) || false}
                  onChange={() => onChange(option.value)}
                  size="small"
                  sx={{
                    color: colorMap?.[option.value] || theme.palette.text.secondary,
                    '&.Mui-checked': {
                      color: colorMap?.[option.value] || theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {option.label}
                  </Typography>
                  {option.count !== undefined && option.count > 0 && (
                    <Chip
                      label={option.count}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                      }}
                    />
                  )}
                </Box>
              }
              sx={{ 
                ml: 0, 
                mr: 0, 
                width: '100%',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );
};

const RuleFilterBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const filters = useFilterStore((state) => state.filters);
  const {
    setSearchTerm,
    setSeverities,
    setPlatforms,
    setTactics,
    setRuleSources,
    setRulePlatforms,
    fetchAllFilterOptions,
  } = useFilterStore();

  const attackPlatformOptions = useAttackPlatformOptions();
  const rulePlatformFilterOptions = useRulePlatformOptions();
  const tacticOptions = useTacticOptions();
  const ruleSourceOptions = useRuleSourceOptions();
  const severityOptions = useSeverityOptions();
  const isLoadingOptions = useIsLoadingOptions();
  const optionsError = useOptionsError();

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoadingOptions && !optionsError && attackPlatformOptions.length === 0) {
      fetchAllFilterOptions();
    }
  }, [isLoadingOptions, optionsError, attackPlatformOptions.length, fetchAllFilterOptions]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchTerm(value || undefined);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout, setSearchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    setSearchTerm(undefined);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [setSearchTerm, searchTimeout]);

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
      case 'severity':
        setSeverities((filters.severity || []).filter((s) => s !== valueToRemove));
        break;
      case 'platforms':
        setPlatforms((filters.platforms || []).filter((p) => p !== valueToRemove));
        break;
      case 'rule_platform':
        setRulePlatforms((filters.rule_platform || []).filter((p) => p !== valueToRemove));
        break;
      case 'rule_source':
        setRuleSources((filters.rule_source || []).filter((s) => s !== valueToRemove));
        break;
      case 'tactics':
        setTactics((filters.tactics || []).filter((t) => t !== valueToRemove));
        break;
      case 'search':
        setSearchValue('');
        setSearchTerm(undefined);
        break;
    }
  }, [filters, setSeverities, setPlatforms, setRulePlatforms, setRuleSources, setTactics, setSearchTerm]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.severity?.length) count += filters.severity.length;
    if (filters.platforms?.length) count += filters.platforms.length;
    if (filters.rule_platform?.length) count += filters.rule_platform.length;
    if (filters.rule_source?.length) count += filters.rule_source.length;
    if (filters.tactics?.length) count += filters.tactics.length;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const renderActiveFilters = () => {
    const chips: React.ReactNode[] = [];

    if (filters.search) {
      chips.push(
        <FilterChip
          key="search"
          label={`"${filters.search}"`}
          category="Search"
          onClear={() => handleRemoveFilter('search', '')}
        />
      );
    }

    filters.severity?.forEach((severity) => {
      chips.push(
        <FilterChip
          key={`severity-${severity}`}
          label={SEVERITY_DISPLAY[severity as RuleSeverity] || severity}
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
          category="ATT&CK"
          onClear={() => handleRemoveFilter('platforms', platform)}
        />
      );
    });

    filters.rule_platform?.forEach((platform) => {
      chips.push(
        <FilterChip
          key={`rule-platform-${platform}`}
          label={platform}
          category="Platform"
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

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        backgroundColor: theme.palette.background.paper,
        overflow: 'visible',
      }}
    >
      {/* Main Filter Bar */}
      <Box sx={{ p: 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="stretch">
          {/* Search Field */}
          <TextField
            placeholder="Search rules by name, ID, or description..."
            value={searchValue}
            onChange={handleSearchChange}
            size="small"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.default, 0.8),
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.background.paper,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Controls */}
          <Stack direction="row" spacing={1}>
            <Button
              variant={filterPanelOpen ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              endIcon={
                activeFilterCount > 0 ? (
                  <Badge
                    badgeContent={activeFilterCount}
                    color="error"
                    sx={{ ml: 1 }}
                  />
                ) : (
                  <KeyboardArrowDownIcon
                    sx={{
                      transform: filterPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                )
              }
              sx={{
                borderColor: alpha(theme.palette.divider, 0.3),
                minWidth: isMobile ? 'auto' : 140,
              }}
            >
              {!isMobile && 'Filters'}
            </Button>

          </Stack>
        </Stack>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {renderActiveFilters()}
          </Box>
        )}
      </Box>

      {/* Filter Panel */}
      <Collapse in={filterPanelOpen}>
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 0,
            '& > *': {
              borderRight: {
                xs: 'none',
                sm: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              },
              '&:last-child': {
                borderRight: 'none',
              },
            },
          }}
        >
          <Box sx={{ borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.12)}`, lg: 'none' } }}>
            <FilterSection
              title="Severity"
              icon={<WarningAmberIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />}
              options={severityOptions}
              selectedValues={filters.severity}
              onChange={handleSeverityChange}
              loading={isLoadingOptions}
              colorMap={SEVERITY_COLORS}
            />
          </Box>

          <Box sx={{ borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.12)}`, lg: 'none' } }}>
            <FilterSection
              title="ATT&CK Platform"
              icon={<SecurityIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />}
              options={attackPlatformOptions}
              selectedValues={filters.platforms}
              onChange={handleAttackPlatformChange}
              loading={isLoadingOptions}
            />
          </Box>

          <Box sx={{ borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.12)}`, lg: 'none' } }}>
            <FilterSection
              title="Rule Platform"
              icon={<DeviceHubIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />}
              options={rulePlatformFilterOptions}
              selectedValues={filters.rule_platform}
              onChange={handleRulePlatformChange}
              loading={isLoadingOptions}
            />
          </Box>

          <Box sx={{ borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.12)}`, lg: 'none' } }}>
            <FilterSection
              title="Source"
              icon={<SourceIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />}
              options={ruleSourceOptions}
              selectedValues={filters.rule_source}
              onChange={handleRuleSourceChange}
              loading={isLoadingOptions}
            />
          </Box>

          <Box>
            <FilterSection
              title="MITRE Tactic"
              icon={<CategoryIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />}
              options={tacticOptions}
              selectedValues={filters.tactics}
              onChange={handleTacticChange}
              loading={isLoadingOptions}
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default RuleFilterBar;