// src/store/rulesStore.ts

import { create } from 'zustand';
import { RuleDetail as Rule } from '@/api/types';

interface RuleState {
  // Currently selected rule (for detail view)
  selectedRule: Rule | null;
  
  // Selected rule IDs (for multi-select operations)
  selectedRuleIds: string[];
  
  // Recently viewed rules (for quick access)
  recentlyViewedRules: Rule[];
  
  // Actions
  selectRule: (rule: Rule | null) => void;
  toggleRuleSelection: (ruleId: string) => void;
  selectRules: (ruleIds: string[]) => void;
  clearSelectedRules: () => void;
  addRecentlyViewedRule: (rule: Rule) => void;
  clearRecentlyViewedRules: () => void;
}

// Maximum number of recently viewed rules to store
const MAX_RECENT_RULES = 10;

export const useRuleStore = create<RuleState>((set) => ({
  // Initial state
  selectedRule: null,
  selectedRuleIds: [],
  recentlyViewedRules: [],
  
  // Actions
  selectRule: (rule) => 
    set({ selectedRule: rule }),
    
  toggleRuleSelection: (ruleId) => 
    set((state) => {
      const isSelected = state.selectedRuleIds.includes(ruleId);
      if (isSelected) {
        return {
          selectedRuleIds: state.selectedRuleIds.filter(id => id !== ruleId)
        };
      } else {
        return {
          selectedRuleIds: [...state.selectedRuleIds, ruleId]
        };
      }
    }),
    
  selectRules: (ruleIds) => 
    set({ selectedRuleIds: ruleIds }),
    
  clearSelectedRules: () => 
    set({ selectedRuleIds: [] }),
    
  addRecentlyViewedRule: (rule) => 
    set((state) => {
      // Filter out the rule if it already exists to avoid duplicates
      const filteredRules = state.recentlyViewedRules.filter(r => r.id !== rule.id);
      
      // Add the new rule to the beginning of the array
      const updatedRules = [rule, ...filteredRules];
      
      // Limit the number of recent rules
      if (updatedRules.length > MAX_RECENT_RULES) {
        updatedRules.pop();
      }
      
      return { recentlyViewedRules: updatedRules };
    }),
    
  clearRecentlyViewedRules: () => 
    set({ recentlyViewedRules: [] }),
}));

// Selector for just the selected rule
export const useSelectedRule = () => useRuleStore((state) => state.selectedRule);

// Selector for selected rule IDs
export const useSelectedRuleIds = () => useRuleStore((state) => state.selectedRuleIds);

// Selector for recently viewed rules
export const useRecentlyViewedRules = () => useRuleStore((state) => state.recentlyViewedRules);

export default useRuleStore;