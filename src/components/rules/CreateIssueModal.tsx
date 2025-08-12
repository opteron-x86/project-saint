// src/components/rules/CreateIssueModal.tsx
import React, { useState } from 'react';
import {
    Box, Button, Modal, Typography, Stepper, Step, StepLabel, CircularProgress
} from '@mui/material';
import { useAuth } from 'react-oidc-context';
import toast from 'react-hot-toast';
import { useCreateIssue } from '../../api/queries';
import { CreateIssuePayload, IssueType } from '../../api/types';
import { IssueTypeSelector, IssueDetailsForm, IssuePreview } from './issue_creator';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
};

const steps = ['Select Issue Type', 'Provide Details', 'Preview & Submit'];

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  ruleId: string;
  ruleName: string;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ open, onClose, ruleId, ruleName }) => {
  const auth = useAuth();
  const createIssueMutation = useCreateIssue();
  
  const [activeStep, setActiveStep] = useState(0);
  const [issueType, setIssueType] = useState<IssueType>('False Positive');
  const [priority, setPriority] = useState('high');
  const [eventSource, setEventSource] = useState('');
  const [eventTimestamp, setEventTimestamp] = useState('');
  const [description, setDescription] = useState('');

  const isStepValid = () => {
    if (activeStep === 1) {
      return description.trim().length > 10;
    }
    return true;
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const clearForm = () => {
    setActiveStep(0);
    setIssueType('False Positive');
    setPriority('high');
    setEventSource('');
    setEventTimestamp('');
    setDescription('');
  };

  const handleClose = () => {
    clearForm();
    onClose();
  }

  const handleSubmit = () => {
    const title = `[${issueType}] ${ruleName} - ${description.split('\n')[0].slice(0, 50)}`;
    
    // Build markdown description with event details if available
    const markdownDescription = `## ${issueType}\n\n**Rule:** ${ruleName} (\`${ruleId}\`)\n**Priority:** ${priority}\n**Submitted by:** ${auth.user?.profile.email || 'Unknown'}\n\n### Event Details\n${eventSource ? `**Source:** \`${eventSource}\`\n` : ''}${eventTimestamp ? `**Timestamp:** \`${eventTimestamp}\`\n` : ''}\n### Description\n${description}`;
    
    const payload: CreateIssuePayload = {
      rule_id: ruleId,
      issue_type: issueType, // Fixed: Changed from issueType to issue_type
      title,
      description: markdownDescription,
      priority: priority as 'low' | 'medium' | 'high' | 'critical',
      contact_email: auth.user?.profile.email || undefined,
    };

    createIssueMutation.mutate({ ruleId, payload }, {
      onSuccess: (data) => {
        toast.success(`Issue created successfully!`);
        if (data.tracking_url) {
          window.open(data.tracking_url, '_blank'); // Fixed: Changed from issue_url to tracking_url
        }
        handleClose();
      },
      onError: (error: unknown) => {
        let errorMessage = 'An unknown error occurred.';
        if (typeof error === 'object' && error !== null) {
          const errorAsObject = error as { details?: { detail?: string }, message?: string };
          if (errorAsObject.details?.detail) {
            errorMessage = errorAsObject.details.detail;
          } else if (errorAsObject.message) {
            errorMessage = errorAsObject.message;
          }
        }
        toast.error(`Failed to create issue: ${errorMessage}`);
      },
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Create Issue for Rule: <strong>{ruleName}</strong>
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mr: -1 }}>
          {activeStep === 0 && <IssueTypeSelector issueType={issueType} setIssueType={setIssueType} setPriority={setPriority} />}
          {activeStep === 1 && <IssueDetailsForm issueType={issueType} description={description} setDescription={setDescription} eventSource={eventSource} setEventSource={setEventSource} eventTimestamp={eventTimestamp} setEventTimestamp={setEventTimestamp} />}
          {activeStep === 2 && <IssuePreview issueType={issueType} description={description} eventSource={eventSource} eventTimestamp={eventTimestamp} ruleName={ruleName} ruleId={ruleId} />}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleClose}>Cancel</Button>
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} variant="contained" disabled={createIssueMutation.isPending} sx={{ ml: 1 }}>
              {createIssueMutation.isPending ? <CircularProgress size={24} /> : 'Submit Issue'}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" disabled={!isStepValid()}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateIssueModal;