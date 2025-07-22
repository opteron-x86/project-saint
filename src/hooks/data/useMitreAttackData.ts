// src/hooks/data/useMitreAttackData.ts
<<<<<<< HEAD
<<<<<<< HEAD
import { useMemo } from 'react';
import {
  useMitreMatrixQuery, 
  useTechniqueCoverageQuery,
  useFilterOptionsQuery,
} from '@/api/queries';

/**
 * Safe array helper - ensures we always get an array
 */
const ensureArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

/**
<<<<<<< HEAD
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
    
    // Ensure matrixData is an array and has safe nested arrays
    const safeMatrixData = ensureArray(matrixData);
    
    return safeMatrixData.map(tactic => ({
      ...tactic,
      techniques: ensureArray(tactic.techniques).map(technique => ({
        ...technique,
        platforms: ensureArray(technique.platforms),
        subtechniques: ensureArray(technique.subtechniques)
      }))
    }));
  }, [matrixData]);

  // Extract available platforms from filter options or matrix data as a fallback
  const availablePlatforms = useMemo(() => {
    if (filterOptionsData?.platforms && filterOptionsData.platforms.length > 0) {
      return filterOptionsData.platforms.map(p => p.value).sort();
    }
    
    // Fallback: derive from the matrix if filter options not available/loaded yet
    if (processedMatrix) {
      const platforms = new Set<string>();
      ensureArray(processedMatrix).forEach(tactic => {
        ensureArray(tactic.techniques).forEach(technique => {
          ensureArray(technique.platforms).forEach(platform => platforms.add(platform));
          ensureArray(technique.subtechniques).forEach(subtech => {
            ensureArray(subtech.platforms).forEach(platform => platforms.add(platform));
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
      ensureArray(coverageData.techniques).forEach(techDetail => {
        ensureArray(techDetail.rules).forEach(rule => {
          // Note: TechniqueRuleInfo might not have rule_source
          // This is mainly for demonstration - prefer filterOptionsData
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
=======
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react'; 
import { apiGet } from '../../api/client';
=======
import { useMemo } from 'react';
import {
<<<<<<< HEAD
  useMitreMatrixQuery,       // <-- Use this hook
  useTechniqueCoverageQuery, // <-- Use this hook
  useFilterOptionsQuery,   // <-- For available platforms/sources if needed here
} from '../../api/queries'; // Assuming queries.ts is at this path
import {
  MitreMatrixData,
  MitreTactic,        // These types should come from api/types.ts
  MitreTechnique,     // and align with the /mitre/matrix response
  TechniquesCoverageResponse,
  // Remove local interface definitions if they are now in api/types.ts
} from '../../api/types'; // Make sure these types are comprehensive
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
  useMitreMatrixQuery, 
  useTechniqueCoverageQuery,
  useFilterOptionsQuery,
} from '@/api/queries';
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)

/**
=======
>>>>>>> 37ba2d8 (Initial commit)
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
    
    // Ensure matrixData is an array and has safe nested arrays
    const safeMatrixData = ensureArray(matrixData);
    
    return safeMatrixData.map(tactic => ({
      ...tactic,
      techniques: ensureArray(tactic.techniques).map(technique => ({
        ...technique,
        platforms: ensureArray(technique.platforms),
        subtechniques: ensureArray(technique.subtechniques)
      }))
    }));
  }, [matrixData]);

  // Extract available platforms from filter options or matrix data as a fallback
  const availablePlatforms = useMemo(() => {
    if (filterOptionsData?.platforms && filterOptionsData.platforms.length > 0) {
      return filterOptionsData.platforms.map(p => p.value).sort();
    }
    
    // Fallback: derive from the matrix if filter options not available/loaded yet
    if (processedMatrix) {
      const platforms = new Set<string>();
      ensureArray(processedMatrix).forEach(tactic => {
        ensureArray(tactic.techniques).forEach(technique => {
          ensureArray(technique.platforms).forEach(platform => platforms.add(platform));
          ensureArray(technique.subtechniques).forEach(subtech => {
            ensureArray(subtech.platforms).forEach(platform => platforms.add(platform));
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
      ensureArray(coverageData.techniques).forEach(techDetail => {
        ensureArray(techDetail.rules).forEach(rule => {
          // Note: TechniqueRuleInfo might not have rule_source
          // This is mainly for demonstration - prefer filterOptionsData
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
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======

<<<<<<< HEAD
<<<<<<< HEAD
// Ensure your components (like AttackMatrix.tsx) are updated to use the
// structure provided by this hook, e.g., matrixData will be List[MitreTactic]
// and coverageData will be TechniquesCoverageResponse.
<<<<<<< HEAD
>>>>>>> 2f90ce0 (refactor to work with the new backend)
=======
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)

export default useMitreAttackData;
>>>>>>> 148a901 (refactor to work with the new backend)
=======
export default useMitreAttackData;
>>>>>>> 37ba2d8 (Initial commit)
