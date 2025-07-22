// src/components/rules/issue_creator/IssuePreview.tsx
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import { ExpandMore, Preview } from '@mui/icons-material';

interface IssuePreviewProps {
    issueType: string;
    description: string;
    eventSource: string;
    eventTimestamp: string;
    ruleName: string;
    ruleId: string;
}

export const IssuePreview: React.FC<IssuePreviewProps> = ({ issueType, description, eventSource, eventTimestamp, ruleName, ruleId }) => {
    const auth = useAuth();

    const generateTitle = () => {
        const typePrefix = {
            'False Positive': '[FP]', 'Performance Issue': '[PERF]', 'Missing Detection': '[GAP]',
            'Bug Report': '[BUG]', 'Tuning Suggestion': '[TUNE]', 'General Query': '[Q]'
        }[issueType] || '[ISSUE]';
        const brief = description.split('\n')[0].slice(0, 50);
        return `${typePrefix} ${ruleName} - ${brief}${brief.length >= 30 ? '...' : ''}`;
    };

    const generateMarkdown = () => {
        return `## ${issueType}
**Rule:** ${ruleName} (\`${ruleId}\`)
**Submitted by:** ${auth.user?.profile.email || 'Unknown'}
**Date:** ${new Date().toISOString().split('T')[0]}
---
### Event Details
${eventSource ? `**Source:** \`${eventSource}\`\n` : ''}
${eventTimestamp ? `**Timestamp:** \`${eventTimestamp}\`\n` : ''}
### Description
${description}
---
*Issue created via SAINT Explorer*`;
    };

    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                3. Preview & Submit
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Issue Title</Typography>
                <Typography variant="subtitle2" fontWeight="bold">{generateTitle()}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Accordion variant="outlined" sx={{ boxShadow: 'none' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Preview fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Preview GitLab Description</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'action.hover', maxHeight: 300, overflow: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', fontFamily: 'monospace', margin: 0 }}>
                            {generateMarkdown()}
                        </pre>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        </Box>
    );
};