// src/hooks/data/useMitreAttackData.ts
import { useMemo } from 'react';
import {
  useMitreMatrixQuery, 
  useTechniqueCoverageQuery,
  useFilterOptionsQuery,
} from '@/api/queries';

/**
 * Custom hook to fetch and process MITRE ATT&CK data with coverage information.
 * It relies on dedicated TanStack Query hooks for fetching.
 */
export const useMitreAttackData = (platformFilter?: string | null) => {
  // Fetch the full matrix data (tactics with nested techniques/subtechniques)
  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
    error: errorMatrix,
  } = useMitreMatrixQuery(); // Default staleTime is Infinity

  // Fetch technique coverage data, potentially filtered by platform
  const {
    data: coverageData,
    isLoading: isLoadingCoverage,
    isError: isErrorCoverage,
    error: errorCoverage,
  } = useTechniqueCoverageQuery(platformFilter); 

  // Fetch filter options (e.g., for deriving all known platforms if needed)
  const { data: filterOptionsData } = useFilterOptionsQuery();

  const processedMatrix = useMemo(() => {
    if (!matrixData) return null;
    // The matrixData should already be in the desired List[TacticResponse] format
    // where TacticResponse includes nested MitreTechniqueResponse (with subtechniques & platforms).
    // So, direct assignment or minimal transformation might be needed.
    return matrixData; // Assuming matrixData is already MitreMatrixData (i.e., MitreTactic[])
  }, [matrixData]);

  // Extract available platforms from filter options or matrix data as a fallback
  const availablePlatforms = useMemo(() => {
    if (filterOptionsData?.platforms && filterOptionsData.platforms.length > 0) {
      return filterOptionsData.platforms.map(p => p.value).sort();
    }
    // Fallback: derive from the matrix if filter options not available/loaded yet
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

  // Extract available rule sources (example, if needed from coverage, though /filters/options is better)
  const availableRuleSources = useMemo(() => {
    if (filterOptionsData?.rule_sources && filterOptionsData.rule_sources.length > 0) {
        return filterOptionsData.rule_sources.map(s => s.value).sort();
    }
    // Fallback if needed, but less comprehensive
    if (coverageData?.techniques) {
      const sources = new Set<string>();
      coverageData.techniques.forEach(techDetail => {
        techDetail.rules.forEach(rule => {
          // Assuming TechniqueRuleInfo doesn't have rule_source, this would need adjustment
          // or the primary source for this is filterOptionsData
        });
      });
      return Array.from(sources).sort();
    }
    return [];
  }, [coverageData, filterOptionsData]);

  return {
    matrix: processedMatrix,
    coverage: coverageData, 
    availablePlatforms,
    availableRuleSources,
    isLoading: isLoadingMatrix || isLoadingCoverage,
    isError: isErrorMatrix || isErrorCoverage,
    error: errorMatrix || errorCoverage,
  };
};


export default useMitreAttackData;