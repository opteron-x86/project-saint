// src/hooks/data/usePaginatedRules.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useRulesQuery } from '../../api/queries';
import { PaginationParams, RuleFilters, RuleSummary } from '../../api/types';
import { GridSortModel } from '@mui/x-data-grid';
import { useFilterStore } from '../../store/filterStore';

export const usePaginatedRules = (initialPage = 1, initialPageSize = 25) => {
  // Get filters from the global filter store
  const filtersFromStore = useFilterStore((state) => state.filters);
  const clearFiltersInStore = useFilterStore((state) => state.clearFilters);

  // Pagination state - using the enhanced PaginationParams interface
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    limit: initialPageSize,
    sortBy: 'modified_date', // Default sort by modified date
    sortDirection: 'desc',
    include_facets: true, // Enable facets for enhanced filtering
  });

  // DataGrid sort model state
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'modified_date', sort: 'desc' },
  ]);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => {
    // Clean up empty arrays and undefined values to prevent unnecessary API calls
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

  // Main query using our enhanced useRulesQuery
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useRulesQuery(pagination, memoizedFilters, {
    // Enhanced error handling
    retry: (failureCount, error: any) => {
      console.log('usePaginatedRules: Query failed, attempt:', failureCount + 1);
      // Don't retry on client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        console.log('usePaginatedRules: Client error, not retrying');
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    // Keep previous data during pagination for better UX
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
    
    // The API client should have already transformed the data,
    // but let's add a safety check to ensure data integrity
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
        // Add default values for new enrichment fields if not present
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

  // Facets data for enhanced filtering (if available)
  const facets = useMemo(() => {
    return data?.facets || null;
  }, [data?.facets]);

  // Page change handler with enhanced logging
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

  // Sort change handler with field name mapping
  const handleSortChange = useCallback((model: GridSortModel) => {
    console.log('usePaginatedRules: Sort change requested:', model);
    
    setSortModel(model);
    
    if (model.length > 0) {
      const { field, sort } = model[0];
      
      // Map frontend field names to API field names if needed
      let apiFieldName = field;
      switch (field) {
        case 'title':
          apiFieldName = 'name'; // API uses 'name' field
          break;
        case 'modified_date':
          apiFieldName = 'updated_date'; // API uses 'updated_date' field
          break;
        case 'rule_source':
          // This might map to different fields depending on API structure
          apiFieldName = 'source_name';
          break;
        default:
          apiFieldName = field;
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
        sortBy: 'updated_date', // Use API field name
        sortDirection: 'desc',
        page: 1,
      }));
      
      console.log('usePaginatedRules: Sort reset to default');
    }
  }, []);

  // Enhanced filter detection with new enrichment filters
  const hasActiveFilters = useMemo(() => {
    const {
      search,
      query,
      severity,
      platforms,
      tactics,
      techniques,
      rule_source,
      tags,
      rule_platform,
      mitre_techniques,
      cve_ids,
      has_mitre_mapping,
      has_cve_references,
      enrichment_score_min,
      is_active,
      validation_status,
    } = memoizedFilters;

    const hasFilters = Boolean(
      search ||
      query ||
      (severity && severity.length > 0) ||
      (platforms && platforms.length > 0) ||
      (tactics && tactics.length > 0) ||
      (techniques && techniques.length > 0) ||
      (rule_source && rule_source.length > 0) ||
      (tags && tags.length > 0) ||
      (rule_platform && rule_platform.length > 0) ||
      (mitre_techniques && mitre_techniques.length > 0) ||
      (cve_ids && cve_ids.length > 0) ||
      (validation_status && validation_status.length > 0) ||
      has_mitre_mapping !== undefined ||
      has_cve_references !== undefined ||
      is_active !== undefined ||
      (enrichment_score_min !== undefined && enrichment_score_min > 0)
    );

    console.log('usePaginatedRules: Active filters check:', {
      hasFilters,
      filterCount: Object.keys(memoizedFilters).length,
    });

    return hasFilters;
  }, [memoizedFilters]);

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
    facets, // New: aggregation data for enhanced filtering
    
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
    
    // Enhanced debugging info
    debugInfo: {
      apiResponse: data,
      currentFilters: memoizedFilters,
      currentPagination: pagination,
    },
  };
};

export default usePaginatedRules;