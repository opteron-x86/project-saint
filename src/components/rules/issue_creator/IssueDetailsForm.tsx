// src/components/rules/issue_creator/IssueDetailsForm.tsx
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { SmartLogInput } from './SmartLogInput';
import { EnhancedDescriptionField } from './EnhancedDescriptionField';
import { IssueType } from '@/api/types';

interface IssueDetailsFormProps {
    issueType: IssueType;
    description: string;
    setDescription: (value: string) => void;
    eventSource: string;
    setEventSource: (value: string) => void;
    eventTimestamp: string;
    setEventTimestamp: (value: string) => void;
}

export const IssueDetailsForm: React.FC<IssueDetailsFormProps> = ({
    issueType,
    description,
    setDescription,
    eventSource,
    setEventSource,
    eventTimestamp,
    setEventTimestamp
}) => {
    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                2. Provide Details
            </Typography>
            
            <Box mb={2}>
              <SmartLogInput
                  setEventSource={setEventSource}
                  setEventTimestamp={setEventTimestamp}
              />
            </Box>

            <TextField
                fullWidth
                label="Event Source (Auto-filled or Manual)"
                value={eventSource}
                onChange={(e) => setEventSource(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., workstation-01, 10.1.2.3"
            />
            <TextField
                fullWidth
                label="Event Timestamp (Auto-filled or Manual)"
                value={eventTimestamp}
                onChange={(e) => setEventTimestamp(e.target.value)}
                placeholder="e.g., 2023-10-27T10:00:00Z"
                sx={{ mb: 2 }}
            />
            
            <EnhancedDescriptionField 
                issueType={issueType}
                description={description}
                setDescription={setDescription}
            />
        </Box>
    );
};