// src/hooks/data/usePaginatedRules.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useRulesQuery, queryKeys } from '../../api/queries';
import { PaginationParams, RuleFilters, RuleSummary } from '../../api/types';
import { GridSortModel } from '@mui/x-data-grid';
import { useFilterStore } from '../../store/filterStore';

// Map frontend field names to backend API field names
const FIELD_NAME_MAPPING: Record<string, string> = {
  // Text fields
  'title': 'name',
  'description': 'description',
  
  // Date fields
  'modified_date': 'updated_date',
  'created_date': 'created_date',
  
  // Source fields
  'rule_source': 'rule_source',  // Backend uses rule_source, not source_name
  
  // Enum fields
  'severity': 'severity',
  'status': 'status',
  'rule_type': 'rule_type',
  
  // Boolean/enrichment fields - backend may not support these for sorting
  'has_mitre_mapping': 'has_mitre',
  'has_cve_references': 'has_cves',
  
  // Array fields - typically not sortable
  'platforms': 'platforms',
  'tags': 'tags',
};

export const usePaginatedRules = (initialPage = 1, initialPageSize = 25) => {
  // Get filters from the global filter store
  const filtersFromStore = useFilterStore((state) => state.filters);
  const clearFiltersInStore = useFilterStore((state) => state.clearFilters);

  // Pagination state - using the enhanced PaginationParams interface
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    limit: initialPageSize,
    sortBy: 'updated_date', // Use backend field name
    sortDirection: 'desc',
    include_facets: true,
  });

  // DataGrid sort model state - use frontend field name
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'modified_date', sort: 'desc' },
  ]);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => {
    const cleanedFilters: RuleFilters = {};
    
    Object.entries(filtersFromStore).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleanedFilters[key as keyof RuleFilters] = value as any;
          }
        } else if (typeof value === 'string') {
          if (value.trim() !== '') {
            cleanedFilters[key as keyof RuleFilters] = value as any;
          }
        } else {
          cleanedFilters[key as keyof RuleFilters] = value as any;
        }
      }
    });
    
    return cleanedFilters;
  }, [filtersFromStore]);

  // Reset to page 1 when filters change
  useEffect(() => {
    console.log('usePaginatedRules: Filters changed, resetting to page 1');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [JSON.stringify(memoizedFilters)]);

  // Main query using useRulesQuery
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isFetching,
  } = useRulesQuery(pagination, memoizedFilters, {
    queryKey: queryKeys.rules(memoizedFilters, pagination),
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    placeholderData: keepPreviousData,
  });

  // Process and validate the API response data
  const rules: RuleSummary[] = useMemo(() => {
    if (!data?.rules) {
      console.log('usePaginatedRules: No rules data available');
      return [];
    }
    
    console.log('usePaginatedRules: Processing rules data:', {
      count: data.rules.length,
      hasEnrichmentData: data.rules.some(r => r.has_mitre_mapping || r.has_cve_references),
    });
    
    return data.rules.map((rule, index) => {
      // Validate required fields
      if (!rule.id) {
        console.warn(`usePaginatedRules: Rule at index ${index} missing ID:`, rule);
      }
      if (!rule.title) {
        console.warn(`usePaginatedRules: Rule at index ${index} missing title:`, rule);
      }
      
      return {
        ...rule,
        // Ensure required fields have fallback values
        id: rule.id || `unknown-${index}`,
        title: rule.title || 'Untitled Rule',
        severity: rule.severity || 'unknown',
        rule_source: rule.rule_source || 'Unknown Source',
        // Add default values for enrichment fields if not present
        has_mitre_mapping: rule.has_mitre_mapping ?? false,
        has_cve_references: rule.has_cve_references ?? false,
        enrichment_score: rule.enrichment_score ?? 0,
      };
    });
  }, [data?.rules]);

  const totalRules = useMemo(() => {
    const total = data?.total || 0;
    console.log('usePaginatedRules: Total rules:', total);
    return total;
  }, [data?.total]);

  const totalPages = useMemo(() => {
    const pages = data?.totalPages || 0;
    console.log('usePaginatedRules: Total pages:', pages);
    return pages;
  }, [data?.totalPages]);

  // Facets data for enhanced filtering
  const facets = useMemo(() => {
    return data?.facets || null;
  }, [data?.facets]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(memoizedFilters).length > 0;
  }, [memoizedFilters]);

  // Page change handler
  const handlePageChange = useCallback((newPage: number, newPageSize?: number) => {
    console.log('usePaginatedRules: Page change requested:', { newPage, newPageSize });
    
    setPagination(prev => {
      const updated = {
        ...prev,
        page: newPage,
        limit: newPageSize ?? prev.limit,
      };
      console.log('usePaginatedRules: Updated pagination:', updated);
      return updated;
    });
  }, []);

  // Sort change handler with comprehensive field name mapping
  const handleSortChange = useCallback((model: GridSortModel) => {
    console.log('usePaginatedRules: Sort change requested:', model);
    
    setSortModel(model);
    
    if (model.length > 0) {
      const { field, sort } = model[0];
      
      // Map frontend field name to backend API field name
      const apiFieldName = FIELD_NAME_MAPPING[field] || field;
      
      // Warn if sorting on a field that backend might not support
      if (!FIELD_NAME_MAPPING[field]) {
        console.warn(`usePaginatedRules: No field mapping for '${field}', using as-is`);
      }
      
      // Check if attempting to sort on array field
      if (['platforms', 'tags', 'techniques', 'tactics'].includes(field)) {
        console.warn(`usePaginatedRules: Sorting on array field '${field}' may not work`);
      }
      
      setPagination(prev => ({
        ...prev,
        sortBy: apiFieldName,
        sortDirection: sort || 'desc',
        page: 1, // Reset to first page when sorting changes
      }));
      
      console.log('usePaginatedRules: Sort applied:', {
        frontendField: field,
        apiField: apiFieldName,
        direction: sort || 'desc',
      });
    } else {
      // Reset to default sort when no sort is applied
      setPagination(prev => ({
        ...prev,
        sortBy: 'updated_date', // Backend field name
        sortDirection: 'desc',
        page: 1,
      }));
      
      setSortModel([{ field: 'modified_date', sort: 'desc' }]); // Frontend field name
      
      console.log('usePaginatedRules: Reset to default sort');
    }
  }, []);

  // Reset filters and pagination
  const resetFiltersAndPage = useCallback(() => {
    console.log('usePaginatedRules: Resetting filters and pagination');
    clearFiltersInStore();
    setPagination(prev => ({
      ...prev,
      page: 1,
      sortBy: 'updated_date',
      sortDirection: 'desc',
    }));
    setSortModel([{ field: 'modified_date', sort: 'desc' }]);
  }, [clearFiltersInStore]);

  // Enhanced refetch function with logging
  const enhancedRefetch = useCallback(() => {
    console.log('usePaginatedRules: Manual refetch requested');
    return refetch();
  }, [refetch]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('usePaginatedRules: State update:', {
      rulesCount: rules.length,
      totalRules,
      currentPage: pagination.page,
      pageSize: pagination.limit,
      isLoading,
      isError,
      hasActiveFilters,
    });
  }, [rules.length, totalRules, pagination.page, pagination.limit, isLoading, isError, hasActiveFilters]);

  return {
    // Data
    rules,
    totalRules,
    totalPages,
    facets,
    
    // Pagination state
    currentPage: pagination.page,
    pageSize: pagination.limit,
    sortModel,
    
    // Filter state
    hasActiveFilters,
    
    // Loading/error state
    isLoading,
    isFetching,
    isError,
    error,
    
    // Actions
    handlePageChange,
    handleSortChange,
    refetch: enhancedRefetch,
    resetFiltersAndPage,
    
    // Debug info
    debugInfo: {
      apiResponse: data,
      currentFilters: memoizedFilters,
      currentPagination: pagination,
    },
  };
};

export default usePaginatedRules;