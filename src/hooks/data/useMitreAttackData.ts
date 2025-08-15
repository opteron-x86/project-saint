// src/hooks/data/useMitreAttackData.ts
import { useMemo } from 'react';
import {
  useMitreMatrixQuery, 
  useTechniqueCoverageQuery,
  useFilterOptionsQuery,
} from '@/api/queries';
import { MitreTactic, TechniquesCoverageResponse } from '@/api/types';

/**
 * Custom hook to fetch and process MITRE ATT&CK data with coverage information.
 */
export const useMitreAttackData = (platformFilter?: string | null) => {
  // Fetch the full matrix data (tactics with nested techniques/subtechniques)
  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
    error: errorMatrix,
    refetch: refetchMatrix,
  } = useMitreMatrixQuery();

  // Fetch technique coverage data, potentially filtered by platform
  const {
    data: coverageData,
    isLoading: isLoadingCoverage,
    isError: isErrorCoverage,
    error: errorCoverage,
    refetch: refetchCoverage,
  } = useTechniqueCoverageQuery(platformFilter);

  // Fetch filter options for platforms and rule sources
  const { data: filterOptionsData } = useFilterOptionsQuery();

  // Process and validate matrix data
  const processedMatrix = useMemo(() => {
    if (!matrixData) return null;
    
    // Ensure data is in the expected format
    if (!Array.isArray(matrixData)) {
      console.error('Matrix data is not an array:', matrixData);
      return null;
    }
    
    // Validate and clean the matrix data
    return matrixData.map((tactic: MitreTactic) => ({
      ...tactic,
      // Ensure techniques array exists
      techniques: (tactic.techniques || []).map(technique => ({
        ...technique,
        // Ensure subtechniques array exists
        subtechniques: technique.subtechniques || [],
        // Ensure platforms array exists
        platforms: technique.platforms || [],
      }))
    }));
  }, [matrixData]);

  // Extract available platforms from filter options or matrix data
  const availablePlatforms = useMemo(() => {
    // Primary source: filter options
    if (filterOptionsData?.platforms && filterOptionsData.platforms.length > 0) {
      return filterOptionsData.platforms.map(p => p.value).sort();
    }
    
    // Fallback: derive from matrix data
    if (processedMatrix) {
      const platforms = new Set<string>();
      processedMatrix.forEach(tactic => {
        tactic.techniques.forEach(technique => {
          technique.platforms?.forEach(platform => platforms.add(platform));
          technique.subtechniques?.forEach(subtech => {
            subtech.platforms?.forEach(platform => platforms.add(platform));
          });
        });
      });
      return Array.from(platforms).sort();
    }
    
    return [];
  }, [processedMatrix, filterOptionsData]);

  // Extract available rule sources from filter options
  const availableRuleSources = useMemo(() => {
    if (filterOptionsData?.rule_sources && filterOptionsData.rule_sources.length > 0) {
      return filterOptionsData.rule_sources.map(s => ({
        value: s.value,
        label: s.label,
        count: 'rule_count' in s ? (s as any).rule_count : 0
      }));
    }
    return [];
  }, [filterOptionsData]);

  // Process coverage data to ensure consistency with matrix IDs
  const processedCoverage = useMemo(() => {
    if (!coverageData) return null;
    
    return {
      ...coverageData,
      // Ensure technique IDs in coverage match the format used in matrix
      techniques: coverageData.techniques.map(tech => ({
        ...tech,
        // technique_id should match the 'id' field in MitreTechnique
        technique_id: tech.technique_id,
      }))
    } as TechniquesCoverageResponse;
  }, [coverageData]);

  // Create a map for quick coverage lookups
  const coverageMap = useMemo(() => {
    if (!processedCoverage) return new Map();
    
    const map = new Map();
    processedCoverage.techniques.forEach(tech => {
      map.set(tech.technique_id, tech);
    });
    return map;
  }, [processedCoverage]);

  return {
    matrix: processedMatrix,
    coverage: processedCoverage,
    coverageMap,
    availablePlatforms,
    availableRuleSources,
    isLoading: isLoadingMatrix || isLoadingCoverage,
    isError: isErrorMatrix || isErrorCoverage,
    error: errorMatrix || errorCoverage,
    refetch: () => {
      refetchMatrix();
      refetchCoverage();
    }
  };
};

export default useMitreAttackData;