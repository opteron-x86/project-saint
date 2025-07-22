<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
// saint-v2/saint-explorer-app/src/hooks/data/usePaginatedRules.ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRulesQuery } from '../../api/queries';
import { PaginationParams, RuleFilters, RuleSummary } from '../../api/types';
import { GridSortModel } from '@mui/x-data-grid';
import { useFilterStore } from '../../store/filterStore';

export const usePaginatedRules = (initialPage = 1, initialPageSize = 25) => {
  const filtersFromStore = useFilterStore((state) => state.filters);
  const clearFiltersInStore = useFilterStore((state) => state.clearFilters);

  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    limit: initialPageSize,
    sortBy: 'modified_date',
    sortDirection: 'desc',
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'modified_date', sort: 'desc' },
  ]);

  const memoizedFilters = useMemo(() => {
    return filtersFromStore;
  }, [filtersFromStore]);

  // FIX: Depend on the stringified version of the filters to break the infinite loop.
  // This effect will now only run when the filter values actually change.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [JSON.stringify(memoizedFilters)]);

=======
// src/hooks/data/usePaginatedRules.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRulesQuery } from '../../api/queries';
import { PaginationParams, RuleFilters, RuleSummary } from '../../api/types';
import { GridSortModel } from '@mui/x-data-grid';
import { useFilterStore } from '../../store/filterStore';

export const usePaginatedRules = (initialPage = 1, initialPageSize = 25) => {
  const filtersFromStore = useFilterStore((state) => state.filters);
  const clearFiltersInStore = useFilterStore((state) => state.clearFilters);

  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    limit: initialPageSize,
    sortBy: 'modified_date',
    sortDirection: 'desc',
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'modified_date', sort: 'desc' },
  ]);

  const memoizedFilters = useMemo(() => {
    return filtersFromStore;
  }, [filtersFromStore]);

  // FIX: Depend on the stringified version of the filters to break the infinite loop.
  // This effect will now only run when the filter values actually change.
  useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    // Only reset if filters actually changed and we're not on page 1
    if (JSON.stringify(prevFilters) !== JSON.stringify(memoizedFilters) && pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
    
    // Update previous filters
    setPrevFilters(memoizedFilters);
  }, [memoizedFilters, prevFilters, pagination.page]);
  
  // Fetch rules with current pagination and filters
>>>>>>> a380730 (Initial deployment)
=======
=======
    console.log('Filters changed, resetting to page 1. New memoizedFilters:', memoizedFilters);
>>>>>>> 5fc485e (update for rulesexplorer filters)
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [JSON.stringify(memoizedFilters)]);

>>>>>>> 2f90ce0 (refactor to work with the new backend)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    isFetching,
  } = useRulesQuery(pagination, memoizedFilters);

  const rules: RuleSummary[] = useMemo(() => data?.rules || [], [data?.rules]);
  const totalRules = useMemo(() => data?.total || 0, [data?.total]);
  const totalPages = useMemo(() => data?.totalPages || 0, [data?.totalPages]);

  const handlePageChange = useCallback((newPage: number, newPageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
      limit: newPageSize ?? prev.limit,
    }));
  }, []);

  const handleSortChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    if (model.length > 0) {
      const { field, sort } = model[0];
      setPagination(prev => ({
        ...prev,
        sortBy: field,
        sortDirection: sort || 'desc',
        page: 1,
      }));
    } else {
        setPagination(prev => ({
            ...prev,
            sortBy: 'modified_date',
            sortDirection: 'desc',
            page: 1,
        }));
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
<<<<<<< HEAD
<<<<<<< HEAD
    const { search, severity, platforms, tactics, techniques, rule_source, tags, rule_platform, validation_status } = memoizedFilters; 
    return !!search ||
      (severity && severity.length > 0) ||
      (platforms && platforms.length > 0) ||
      (tactics && tactics.length > 0) ||
      (techniques && techniques.length > 0) ||
      (rule_source && rule_source.length > 0) ||
      (tags && tags.length > 0) ||
      (rule_platform && rule_platform.length > 0) ||
      (validation_status && validation_status.length > 0); 
  }, [memoizedFilters]);

  const resetFiltersAndPage = useCallback(() => {
    clearFiltersInStore();
  }, [clearFiltersInStore]);

  return {
=======
    isRefetching,
  } = useRulesQuery(pagination, memoizedFilters);
  
  // Calculate local stats when rules data changes
=======
    isFetching, // Use isFetching for background updates / refetch indicators
  } = useRulesQuery(pagination, memoizedFilters); // Pass pagination and memoizedFilters

  // Local stats derived from the current page of fetched rules
  const [localStats, setLocalStats] = useState<any>(null); // Type this properly if structure is known
>>>>>>> 2f90ce0 (refactor to work with the new backend)
  useEffect(() => {
    if (data?.rules) {
      // generateRuleStats expects Rule[] which might be more detailed than RuleSummary[]
      // Adjust generateRuleStats or cast if necessary, or accept RuleSummary[]
      const stats = generateRuleStats(data.rules as any); // Cast for now, review generateRuleStats
      setLocalStats(stats);
    }
  }, [data?.rules]);
=======
    isFetching,
  } = useRulesQuery(pagination, memoizedFilters);
>>>>>>> 5fc485e (update for rulesexplorer filters)

  const rules: RuleSummary[] = useMemo(() => data?.rules || [], [data?.rules]);
  const totalRules = useMemo(() => data?.total || 0, [data?.total]);
  const totalPages = useMemo(() => data?.totalPages || 0, [data?.totalPages]);

  const handlePageChange = useCallback((newPage: number, newPageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
      limit: newPageSize ?? prev.limit,
    }));
  }, []);

  const handleSortChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    if (model.length > 0) {
      const { field, sort } = model[0];
      setPagination(prev => ({
        ...prev,
        sortBy: field,
        sortDirection: sort || 'desc',
        page: 1,
      }));
    } else {
        setPagination(prev => ({
            ...prev,
            sortBy: 'modified_date',
            sortDirection: 'desc',
            page: 1,
        }));
    }
  }, []);

  const hasActiveFilters = useMemo(() => {
    // Check based on the actual content of memoizedFilters
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    const { search, severity, platforms, tactics, techniques, rule_source, tags, rule_platform } = memoizedFilters;
=======
    const { search, severity, platforms, tactics, techniques, rule_source, tags, rule_platform, validation_status } = memoizedFilters; 
>>>>>>> 37ba2d8 (Initial commit)
    return !!search ||
      (severity && severity.length > 0) ||
      (platforms && platforms.length > 0) ||
      (tactics && tactics.length > 0) ||
      (techniques && techniques.length > 0) ||
      (rule_source && rule_source.length > 0) ||
      (tags && tags.length > 0) ||
      (rule_platform && rule_platform.length > 0) ||
      (validation_status && validation_status.length > 0); 
  }, [memoizedFilters]);

  const resetFiltersAndPage = useCallback(() => {
    clearFiltersInStore();
  }, [clearFiltersInStore]);

  return {
<<<<<<< HEAD
    // Data
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    rules,
    totalRules,
    totalPages,
    currentPage: pagination.page,
    pageSize: pagination.limit,
    sortModel,
    hasActiveFilters,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
    isLoading,
    isFetching,
    isError,
    error,
=======
    stats: localStats,
    
    // Loading states
=======
    stats: localStats, // Stats for the current page of rules
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
    // stats: localStats, // Removed for now
>>>>>>> 5fc485e (update for rulesexplorer filters)
    isLoading,
    isFetching,
    isError,
    error,
<<<<<<< HEAD
    
    // Actions
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 2f90ce0 (refactor to work with the new backend)
    handlePageChange,
    handleSortChange,
    refetch,
    resetFiltersAndPage,
  };
};

export default usePaginatedRules;