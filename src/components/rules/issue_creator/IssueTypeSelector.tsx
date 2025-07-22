// src/components/rules/issue_creator/IssueTypeSelector.tsx
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { IssueType } from '@/api/types'; // Assuming IssueType is defined in your types

// A more detailed definition for the issue types used in this component
const ENHANCED_ISSUE_TYPES: {
    value: IssueType;
    label: string;
    icon: string;
    description: string;
    priority: string;
    color: string;
}[] = [
  { value: 'False Positive', label: 'False Positive', icon: '⚠️', description: 'Rule triggers on legitimate activity', priority: 'High', color: '#ff9800' },
  { value: 'Tuning Suggestion', label: 'Tuning Suggestion', icon: '🔧', description: 'Improvement to existing rule', priority: 'Medium', color: '#2196f3' },
  { value: 'Performance Issue', label: 'Performance Issue', icon: '⚡', description: 'Rule causes performance problems', priority: 'High', color: '#f44336' },
  { value: 'Missing Detection', label: 'Missing Detection', icon: '🔍', description: 'Gap in detection coverage', priority: 'Medium', color: '#9c27b0' },
  { value: 'Bug Report', label: 'Bug Report', icon: '🐛', description: 'Rule logic or behavior issue', priority: 'High', color: '#e91e63' },
  { value: 'General Query', label: 'General Query', icon: '❓', description: 'Question or general feedback', priority: 'Low', color: '#607d8b' }
];

interface IssueTypeSelectorProps {
  issueType: string;
  setIssueType: (value: IssueType) => void;
  setPriority: (value: string) => void;
}

export const IssueTypeSelector: React.FC<IssueTypeSelectorProps> = ({ issueType, setIssueType, setPriority }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        1. What type of issue are you reporting?
      </Typography>
      <Grid container spacing={2}>
        {ENHANCED_ISSUE_TYPES.map((type) => (
          // FIX: Use the modern `size` prop for the Grid component and remove the `item` prop.
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type.value}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: issueType === type.value ? type.color : 'transparent',
                backgroundColor: issueType === type.value ? `${type.color}1A` : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  borderColor: `${type.color}80`,
                  transform: 'translateY(-3px)',
                  boxShadow: 3
                }
              }}
              onClick={() => {
                setIssueType(type.value);
                setPriority(type.priority);
              }}
            >
              <CardContent sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>{type.icon}</Typography>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {type.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ flexGrow: 1 }}>
                  {type.description}
                </Typography>
                {/* FIX: Add the Chip component back into the card content */}
                <Chip 
                  size="small" 
                  label={type.priority} 
                  sx={{ 
                    mt: 1.5, 
                    backgroundColor: type.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    alignSelf: 'center'
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};