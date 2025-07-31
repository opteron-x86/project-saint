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
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [JSON.stringify(memoizedFilters)]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
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
    const { search, severity, platforms, tactics, techniques, rule_source, tags, rule_platform } = memoizedFilters;
    return !!search ||
      (severity && severity.length > 0) ||
      (platforms && platforms.length > 0) ||
      (tactics && tactics.length > 0) ||
      (techniques && techniques.length > 0) ||
      (rule_source && rule_source.length > 0) ||
      (tags && tags.length > 0) ||
      (rule_platform && rule_platform.length > 0);
  }, [memoizedFilters]);

  const resetFiltersAndPage = useCallback(() => {
    clearFiltersInStore();
  }, [clearFiltersInStore]);

  return {
    rules,
    totalRules,
    totalPages,
    currentPage: pagination.page,
    pageSize: pagination.limit,
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
  };
};

export default usePaginatedRules;