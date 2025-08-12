// src/utils/featureFlags.ts
export const FEATURE_FLAGS = {
    ATTACK_MATRIX_ENABLED: false, // Set to true when ready
    INSIGHTS_ENABLED: true,
    RULES_EXPLORER_ENABLED: true,
    DASHBOARD_ENABLED: true,
  } as const;
  
  export const UNDER_CONSTRUCTION_CONFIG = {
    'attack-matrix': {
      pageName: 'Attack Matrix',
      description: 'The MITRE ATT&CK matrix visualization is currently under development. This feature will provide an interactive view of techniques and coverage data.',
    },
    insights: {
      pageName: 'Insights',
      description: 'Advanced analytics and insights are coming soon.',
    },
  } as const;
  
  export type PageKey = keyof typeof UNDER_CONSTRUCTION_CONFIG;