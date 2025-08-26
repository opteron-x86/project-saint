// src/contexts/FilterContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFilterStore } from '@/store/filterStore';
import { RuleFilters } from '@/api/types';

interface FilterContextValue {
  // Global search
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  clearGlobalSearch: () => void;
  
  // Route-specific filters
  currentFilters: RuleFilters;
  updateFilters: (filters: Partial<RuleFilters>) => void;
  clearAllFilters: () => void;
  
  // Filter state
  hasActiveFilters: boolean;
  activeFilterCount: number;
  
  // Route awareness
  currentRoute: string;
  isSearchEnabled: boolean;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

interface FilterProviderProps {
  children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Global search state (separate from filter store)
  const [globalSearch, setGlobalSearchState] = useState('');
  
  // Connect to existing filter store
  const {
    filters,
    setSearchTerm,
    setSeverities,
    setPlatforms,
    setRulePlatforms,
    setRuleSources,
    setTactics,
    clearFilters,
  } = useFilterStore();

  // Routes where search is enabled
  const searchEnabledRoutes = ['/rules', '/attack-matrix', '/insights'];
  const isSearchEnabled = searchEnabledRoutes.includes(location.pathname);

  // Handle global search changes
  const setGlobalSearch = useCallback((value: string) => {
    setGlobalSearchState(value);
    
    // Apply to filter store based on current route
    if (location.pathname === '/rules') {
      setSearchTerm(value || undefined);
    }
    // Add route-specific handlers as needed
  }, [location.pathname, setSearchTerm]);

  const clearGlobalSearch = useCallback(() => {
    setGlobalSearchState('');
    setSearchTerm(undefined);
  }, [setSearchTerm]);

  // Update filters with proper typing
  const updateFilters = useCallback((newFilters: Partial<RuleFilters>) => {
    if (newFilters.search !== undefined) {
      setSearchTerm(newFilters.search || undefined);
    }
    if (newFilters.severity !== undefined) {
      setSeverities(newFilters.severity);
    }
    if (newFilters.platforms !== undefined) {
      setPlatforms(newFilters.platforms);
    }
    if (newFilters.rule_platform !== undefined) {
      setRulePlatforms(newFilters.rule_platform);
    }
    if (newFilters.rule_source !== undefined) {
      setRuleSources(newFilters.rule_source);
    }
    if (newFilters.tactics !== undefined) {
      setTactics(newFilters.tactics);
    }
  }, [
    setSearchTerm,
    setSeverities,
    setPlatforms,
    setRulePlatforms,
    setRuleSources,
    setTactics,
  ]);

  const clearAllFilters = useCallback(() => {
    clearFilters();
    setGlobalSearchState('');
  }, [clearFilters]);

  // Compute active filter state
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.severity && filters.severity.length > 0) ||
      (filters.platforms && filters.platforms.length > 0) ||
      (filters.rule_platform && filters.rule_platform.length > 0) ||
      (filters.rule_source && filters.rule_source.length > 0) ||
      (filters.tactics && filters.tactics.length > 0)
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.severity && filters.severity.length > 0) count += filters.severity.length;
    if (filters.platforms && filters.platforms.length > 0) count += filters.platforms.length;
    if (filters.rule_platform && filters.rule_platform.length > 0) count += filters.rule_platform.length;
    if (filters.rule_source && filters.rule_source.length > 0) count += filters.rule_source.length;
    if (filters.tactics && filters.tactics.length > 0) count += filters.tactics.length;
    return count;
  }, [filters]);

  // Sync global search with filter store search on route changes
  useEffect(() => {
    if (location.pathname === '/rules' && filters.search) {
      setGlobalSearchState(filters.search);
    }
  }, [location.pathname, filters.search]);

  // Parse URL params for filter persistence
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    
    if (searchParam && isSearchEnabled) {
      setGlobalSearch(searchParam);
    }
  }, [location.search, isSearchEnabled, setGlobalSearch]);

  // Update URL when filters change
  useEffect(() => {
    if (!isSearchEnabled) return;
    
    const params = new URLSearchParams(location.search);
    
    if (globalSearch) {
      params.set('search', globalSearch);
    } else {
      params.delete('search');
    }
    
    const newSearch = params.toString();
    const currentSearch = location.search.slice(1);
    
    if (newSearch !== currentSearch) {
      navigate({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : '',
      }, { replace: true });
    }
  }, [globalSearch, isSearchEnabled, location.pathname, location.search, navigate]);

  const value: FilterContextValue = {
    globalSearch,
    setGlobalSearch,
    clearGlobalSearch,
    currentFilters: filters,
    updateFilters,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    currentRoute: location.pathname,
    isSearchEnabled,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};

// Convenience hooks for specific use cases
export const useGlobalSearch = () => {
  const { globalSearch, setGlobalSearch, clearGlobalSearch, isSearchEnabled } = useFilters();
  return { globalSearch, setGlobalSearch, clearGlobalSearch, isSearchEnabled };
};

export const useActiveFilters = () => {
  const { currentFilters, hasActiveFilters, activeFilterCount } = useFilters();
  return { filters: currentFilters, hasActiveFilters, activeFilterCount };
};