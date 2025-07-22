// src/components/rules/issue_creator/EnhancedDescriptionField.tsx
import React from 'react';
import { Box, TextField, Tooltip, IconButton, InputAdornment, Typography } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { DESCRIPTION_TEMPLATES } from '@/utils/issueTemplates';
import { IssueType } from '@/api/types';

interface EnhancedDescriptionFieldProps {
  description: string;
  setDescription: (value: string) => void;
  issueType: IssueType;
}

export const EnhancedDescriptionField: React.FC<EnhancedDescriptionFieldProps> = ({
  description,
  setDescription,
  issueType,
}) => {
  const template = DESCRIPTION_TEMPLATES[issueType];

  const insertTemplate = () => {
    if (template) {
      setDescription(template.placeholder);
    }
  };
  
  const characterCount = description.length;

  return (
    <TextField
      fullWidth
      multiline
      rows={12}
      label="Detailed Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder={template?.placeholder.slice(0, 150) + '...'}
      helperText={
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {template?.requiredSections ? `Required Sections: ${template.requiredSections.join(', ')}` : ''}
            </Typography>
            <Typography variant="caption">{characterCount} / 5000</Typography>
        </Box>
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
            <Tooltip title="Insert Guided Template">
              <IconButton size="small" onClick={insertTemplate}>
                <AutoAwesome />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};