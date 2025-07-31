// src/utils/constants.ts

/**
 * Application constants
 */

// Severity levels
export const SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    UNKNOWN: 'unknown',
  };
  
  // Severity display names
  export const SEVERITY_DISPLAY = {
    [SEVERITY_LEVELS.CRITICAL]: 'Critical',
    [SEVERITY_LEVELS.HIGH]: 'High',
    [SEVERITY_LEVELS.MEDIUM]: 'Medium',
    [SEVERITY_LEVELS.LOW]: 'Low',
    [SEVERITY_LEVELS.UNKNOWN]: 'Unknown',
  };
  
  // Severity colors
  export const SEVERITY_COLORS = {
    [SEVERITY_LEVELS.CRITICAL]: '#dc2626',
    [SEVERITY_LEVELS.HIGH]: '#ea580c',
    [SEVERITY_LEVELS.MEDIUM]: '#d97706',
    [SEVERITY_LEVELS.LOW]: '#65a30d',
    [SEVERITY_LEVELS.UNKNOWN]: '#6b7280',
  };
  
  // Common platforms
  export const PLATFORMS = {
    AWS: 'AWS',
    AZURE: 'Azure',
    GCP: 'GCP',
    OFFICE365: 'Office 365',
    WINDOWS: 'Windows',
    LINUX: 'Linux',
    MACOS: 'macOS',
    KUBERNETES: 'Kubernetes',
  };
  
  // Platform colors
  export const PLATFORM_COLORS = {
    [PLATFORMS.AWS]: '#FF9900',
    [PLATFORMS.AZURE]: '#0078D4',
    [PLATFORMS.GCP]: '#4285F4',
    [PLATFORMS.OFFICE365]: '#D83B01',
    [PLATFORMS.WINDOWS]: '#0078D6',
    [PLATFORMS.LINUX]: '#FCC624',
    [PLATFORMS.MACOS]: '#000000',
    [PLATFORMS.KUBERNETES]: '#326CE5',
    DEFAULT: '#6B7280',
  };
  
  // Rule sources
  export const RULE_SOURCES = {
    ELASTIC: 'elastic',
    MICROSOFT: 'microsoft',
    CUSTOM: 'custom',
  };
  
  // Rule source display names
  export const RULE_SOURCE_DISPLAY = {
    [RULE_SOURCES.ELASTIC]: 'Elastic',
    [RULE_SOURCES.MICROSOFT]: 'Microsoft',
    [RULE_SOURCES.CUSTOM]: 'Custom',
  };
  
  // Rule source colors
  export const RULE_SOURCE_COLORS = {
    [RULE_SOURCES.ELASTIC]: '#00BFB3',
    [RULE_SOURCES.MICROSOFT]: '#0078D4',
    [RULE_SOURCES.CUSTOM]: '#6B7280',
  };
  
  // Query languages
  export const QUERY_LANGUAGES = {
    KQL: 'kuery',
    LUCENE: 'lucene',
    EQL: 'eql',
  };
  
  // Date range presets
  export const DATE_RANGES = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST_7_DAYS: 'last7Days',
    LAST_30_DAYS: 'last30Days',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    THIS_YEAR: 'thisYear',
    CUSTOM: 'custom',
  };
  
  // Date range configurations
  export const DATE_RANGE_CONFIG = {
    [DATE_RANGES.TODAY]: {
      label: 'Today',
      getDateRange: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today.toISOString(), end: new Date().toISOString() };
      },
    },
    [DATE_RANGES.YESTERDAY]: {
      label: 'Yesterday',
      getDateRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return { start: yesterday.toISOString(), end: today.toISOString() };
      },
    },
    [DATE_RANGES.LAST_7_DAYS]: {
      label: 'Last 7 Days',
      getDateRange: () => {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        return { start: last7Days.toISOString(), end: new Date().toISOString() };
      },
    },
    [DATE_RANGES.LAST_30_DAYS]: {
      label: 'Last 30 Days',
      getDateRange: () => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        return { start: last30Days.toISOString(), end: new Date().toISOString() };
      },
    },
    [DATE_RANGES.THIS_MONTH]: {
      label: 'This Month',
      getDateRange: () => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        return { start: thisMonth.toISOString(), end: new Date().toISOString() };
      },
    },
    [DATE_RANGES.LAST_MONTH]: {
      label: 'Last Month',
      getDateRange: () => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        return { start: lastMonth.toISOString(), end: thisMonth.toISOString() };
      },
    },
    [DATE_RANGES.THIS_YEAR]: {
      label: 'This Year',
      getDateRange: () => {
        const thisYear = new Date();
        thisYear.setMonth(0, 1);
        thisYear.setHours(0, 0, 0, 0);
        
        return { start: thisYear.toISOString(), end: new Date().toISOString() };
      },
    },
    [DATE_RANGES.CUSTOM]: {
      label: 'Custom Range',
      getDateRange: null,
    },
  };
  
  // Page sizes for tables
  export const PAGE_SIZES = [10, 25, 50, 100];
  
  // Default page size
  export const DEFAULT_PAGE_SIZE = 24;
  
  // Default sort field
  export const DEFAULT_SORT_FIELD = 'created_date';
  
  // Default sort direction
  export const DEFAULT_SORT_DIRECTION = 'desc';
  
  // Chart colors
  export const CHART_COLORS = [
    '#2563eb', // Blue-600
    '#7c3aed', // Violet-600
    '#0891b2', // Cyan-600
    '#ea580c', // Orange-600
    '#16a34a', // Green-600
    '#d97706', // Amber-600
    '#dc2626', // Red-600
    '#475569', // Gray-600
  ];
  
  export default {
    SEVERITY_LEVELS,
    SEVERITY_DISPLAY,
    SEVERITY_COLORS,
    PLATFORMS,
    PLATFORM_COLORS,
    RULE_SOURCES,
    RULE_SOURCE_DISPLAY,
    RULE_SOURCE_COLORS,
    QUERY_LANGUAGES,
    DATE_RANGES,
    DATE_RANGE_CONFIG,
    PAGE_SIZES,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SORT_FIELD,
    DEFAULT_SORT_DIRECTION,
    CHART_COLORS,
  };