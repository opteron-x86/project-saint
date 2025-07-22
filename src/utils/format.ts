// src/utils/format.ts

/**
 * Utility functions for formatting data
 */

// Format date in a readable format
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Format date with time
  export const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return dateString;
    }
  };
  
  // Format severity with color code
  export const getSeverityColor = (severity: string): string => {
    const severityLower = severity.toLowerCase();
    
    switch (severityLower) {
      case 'critical':
        return '#dc2626'; // Red-600
      case 'high':
        return '#ea580c'; // Orange-600
      case 'medium':
        return '#d97706'; // Amber-600
      case 'low':
        return '#65a30d'; // Lime-600
      default:
        return '#6b7280'; // Gray-500
    }
  };
  
  // Format platform icon
  export const getPlatformIcon = (platform: string): string => {
    const platformLower = platform.toLowerCase();
    
    if (platformLower.includes('aws')) return 'aws';
    if (platformLower.includes('azure')) return 'azure';
    if (platformLower.includes('gcp')) return 'gcp';
    if (platformLower.includes('office') || platformLower.includes('o365')) return 'office365';
    if (platformLower.includes('windows')) return 'windows';
    if (platformLower.includes('linux')) return 'linux';
    if (platformLower.includes('macos') || platformLower.includes('mac')) return 'macos';
    if (platformLower.includes('container') || platformLower.includes('kubernetes')) return 'kubernetes';
    
    return 'default';
  };
  
  // Truncate text with ellipsis
  export const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength)}...`;
  };
  
  // Format number with thousands separator
  export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  // Calculate percentage
  export const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };
  
  // Convert arrays to comma-separated string
  export const arrayToString = (arr: string[] | undefined): string => {
    if (!arr || arr.length === 0) return '-';
    return arr.join(', ');
  };
  
  // Format risk score (0-100) to category
  export const formatRiskScore = (score: number): string => {
    if (score >= 90) return 'Critical';
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 0) return 'Low';
    return 'Unknown';
  };
  
  // Format query language for display
  export const formatQueryLanguage = (language: string): string => {
    const languageLower = language.toLowerCase();
    
    switch (languageLower) {
      case 'kuery':
        return 'KQL';
      case 'lucene':
        return 'Lucene';
      case 'eql':
        return 'EQL';
      default:
        return language;
    }
  };
  
  // Convert camelCase to Title Case
  export const camelToTitleCase = (camelCase: string): string => {
    // Add a space before all caps and uppercase the first character
    const result = camelCase
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    
    return result;
  };
  
  export default {
    formatDate,
    formatDateTime,
    getSeverityColor,
    getPlatformIcon,
    truncateText,
    formatNumber,
    calculatePercentage,
    arrayToString,
    formatRiskScore,
    formatQueryLanguage,
    camelToTitleCase,
  };

  export const formatStorageKey = (key: string): string => {
    return `saint_explorer_${key}`;
  };