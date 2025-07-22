import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing rule bookmarks with local storage persistence
 */
export const useRuleBookmarks = () => {
  // Initialize state from localStorage
  const [bookmarkedRules, setBookmarkedRules] = useState<Set<string>>(() => {
    try {
      const storedBookmarks = localStorage.getItem('rule-bookmarks');
      if (storedBookmarks) {
        return new Set(JSON.parse(storedBookmarks));
      }
      return new Set<string>();
    } catch (error) {
      console.error('Error loading bookmarks from localStorage:', error);
      return new Set<string>();
    }
  });
  
  // Toggle bookmark state for a rule
  const toggleBookmark = useCallback((ruleId: string) => {
    setBookmarkedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);
  
  // Add a bookmark
  const addBookmark = useCallback((ruleId: string) => {
    setBookmarkedRules(prev => {
      const newSet = new Set(prev);
      newSet.add(ruleId);
      return newSet;
    });
  }, []);
  
  // Remove a bookmark
  const removeBookmark = useCallback((ruleId: string) => {
    setBookmarkedRules(prev => {
      const newSet = new Set(prev);
      newSet.delete(ruleId);
      return newSet;
    });
  }, []);
  
  // Check if a rule is bookmarked
  const isBookmarked = useCallback((ruleId: string) => {
    return bookmarkedRules.has(ruleId);
  }, [bookmarkedRules]);
  
  // Clear all bookmarks
  const clearAllBookmarks = useCallback(() => {
    setBookmarkedRules(new Set());
  }, []);
  
  // Persist bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('rule-bookmarks', JSON.stringify([...bookmarkedRules]));
  }, [bookmarkedRules]);
  
  return {
    bookmarkedRules,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearAllBookmarks,
  };
};

export default useRuleBookmarks;