// src/components/rules/RuleDetail.tsx

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useMemo } from 'react';
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
import {
  Box, Typography, Divider, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
<<<<<<< HEAD
  useMediaQuery, AppBar, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
=======
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 318d3ed (fixes for rule explorer)
=======
import React, { useState, useEffect } from 'react'; // Added useEffect
>>>>>>> dd60c26 (updated ruledetail)
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 35e3c66 (ruledetail ui and layout fixes)
import {
  Box, Typography, Divider, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
  useMediaQuery, Toolbar, // Added Toolbar
=======
  useMediaQuery, Toolbar, Button,
>>>>>>> 23a6656 (Feature/issue creator)
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
<<<<<<< HEAD
<<<<<<< HEAD
import ShareIcon from '@mui/icons-material/Share';
>>>>>>> a380730 (Initial deployment)
=======
import ShareIcon from '@mui/icons-material/Share'; // Keep if share functionality is planned
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
import ShareIcon from '@mui/icons-material/Share';
>>>>>>> 8d2984b (error fixes for ruledetail)
=======
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Divider, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
  useMediaQuery, AppBar, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
>>>>>>> 37ba2d8 (Initial commit)
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HubIcon from '@mui/icons-material/Hub'; // For Techniques
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // For Tactics
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport'; // For Create Issue
import GavelIcon from '@mui/icons-material/Gavel'; // For License
import ArticleIcon from '@mui/icons-material/Article'; // For References
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';
=======
import SecurityIcon from '@mui/icons-material/Security';
=======
>>>>>>> 37ba2d8 (Initial commit)
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HubIcon from '@mui/icons-material/Hub'; // For Techniques
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // For Tactics
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport'; // For Create Issue
import GavelIcon from '@mui/icons-material/Gavel'; // For License
import ArticleIcon from '@mui/icons-material/Article'; // For References
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';

<<<<<<< HEAD
>>>>>>> 318d3ed (fixes for rule explorer)

=======
>>>>>>> 37ba2d8 (Initial commit)
import { RuleDetail as RuleDetailType, RuleSeverity as RuleSeverityEnum } from '../../api/types';
import { StatusBadge } from '../common';
import { formatDateTime, formatQueryLanguage } from '../../utils/format';
import { SEVERITY_DISPLAY } from '../../utils/constants';
import RuleTagsDisplay from './RuleTagsDisplay';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { CreateIssueModal } from './CreateIssueModal';
<<<<<<< HEAD
=======
import { CreateIssueModal } from './CreateIssueModal';
>>>>>>> 37ba2d8 (Initial commit)
import { useRuleStore } from '@/store';
import { useParsedRuleData } from '@/hooks/data/useParsedRuleData'; // Import the new hook

// --- Reusable Sub-Components ---
<<<<<<< HEAD
=======
import SecurityIcon from '@mui/icons-material/Security';
<<<<<<< HEAD
import { Rule } from '../../api/types';
import { StatusBadge, LoadingIndicator, ErrorDisplay } from '../common';
import { formatDate, formatDateTime, formatQueryLanguage } from '../../utils/format';
import { SEVERITY_DISPLAY } from '../../utils/constants';
>>>>>>> a380730 (Initial deployment)
=======
import SecurityIcon from '@mui/icons-material/Security'; // For MITRE tab
import LanguageIcon from '@mui/icons-material/Language'; // For Platforms
=======
import SecurityIcon from '@mui/icons-material/Security';
<<<<<<< HEAD
// LanguageIcon removed - not used
// PlatformIcon (renamed from LanguageIcon) /
// import PlatformIcon from '@mui/icons-material/Language'; // Example if you wanted a generic platform icon
>>>>>>> 8d2984b (error fixes for ruledetail)
=======
// LanguageIcon was removed as unused.
>>>>>>> 0d2fbe6 (error fixes for ruledetail)
=======
import LanguageIcon from '@mui/icons-material/Language'; // For Rule Platforms
import DnsIcon from '@mui/icons-material/Dns'; // For ATT&CK Platforms

>>>>>>> 984e985 (backend rework for rule_platforms)

import { RuleDetail as RuleDetailType, RuleSeverity as RuleSeverityEnum } from '../../api/types';
import { StatusBadge } from '../common';
import { formatDateTime, formatQueryLanguage } from '../../utils/format';
import { SEVERITY_DISPLAY } from '../../utils/constants';
<<<<<<< HEAD
import RuleTagsDisplay from './RuleTagsDisplay'; // Assuming this component is for tags array
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
import RuleTagsDisplay from './RuleTagsDisplay';
>>>>>>> 8d2984b (error fixes for ruledetail)
=======
import { useMitreMatrixQuery } from '@/api/queries'; // To get Tactic names
>>>>>>> dd60c26 (updated ruledetail)
=======
import { useMitreMatrixQuery } from '@/api/queries';
<<<<<<< HEAD
>>>>>>> 35e3c66 (ruledetail ui and layout fixes)
=======
import { CreateIssueModal } from './CreateIssueModal';
>>>>>>> 23a6656 (Feature/issue creator)
=======
import { useRuleStore } from '@/store'; // Import the rule store
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
>>>>>>> 37ba2d8 (Initial commit)

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`rule-tabpanel-${index}`} aria-labelledby={`rule-tab-${index}`} {...other}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);
<<<<<<< HEAD

interface DetailGridItemProps {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}
const DetailGridItem: React.FC<DetailGridItemProps> = ({ label, value, children }) => {
  if (!value && !children && (!children || (Array.isArray(children) && children.length === 0))) return null;
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, gridColumn: '1 / span 1', pt: 0.5, pr: 1, textAlign: 'right' }}>{label}:</Typography>
      <Box sx={{ gridColumn: '2 / -1', pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {children || <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{String(value ?? '-')}</Typography>}
      </Box>
    </>
  );
};

// --- Main Component ---

interface RuleDetailProps {
  rule: RuleDetailType | null;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
  isBookmarked = false,
  onClose,
  onBookmark,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);

  // Use the new custom hook to get parsed data
  const parsedData = useParsedRuleData(rule);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(message))
      .catch(() => toast.error("Failed to copy."));
  };

  if (!rule || !parsedData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No rule data to display.</Typography>
      </Box>
    );
  }

  const { id, title, description, rule_source, created_date, modified_date, status, raw_rule } = rule;
  const { query, language, author, references, risk_score, interval, license, tactics, techniques, cves, tags } = parsedData;
  const severity = rule.severity || 'unknown';
  const severityDisplay = SEVERITY_DISPLAY[severity as RuleSeverityEnum] || 'Unknown';
  const validation_status = raw_rule?.validation_status;

  let validationIcon = <HelpOutlineIcon fontSize="inherit" />;
  let validationChipLabel = "Unknown";
  let validationChipColor: "default" | "success" | "error" = "default";
  if (validation_status?.toLowerCase() === 'validated') {
    validationIcon = <CheckCircleOutlineIcon fontSize="inherit" />;
    validationChipLabel = "Validated";
    validationChipColor = "success";
  } else if (validation_status?.toLowerCase() === 'not_validated') {
    validationIcon = <HighlightOffIcon fontSize="inherit" />;
    validationChipLabel = "Not Validated";
    validationChipColor = "error";
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ pr: 1, overflow: 'hidden' }}>
            <Tooltip title={title}><Typography variant="h6" fontWeight="bold" noWrap gutterBottom>{title}</Typography></Tooltip>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={rule_source} size="small" />
              <StatusBadge label={severityDisplay} status={severity.toLowerCase()} size="small" />
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {onBookmark && (
              <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
                <IconButton size="small" onClick={() => onBookmark(id)} sx={{ color: isBookmarked ? 'warning.main' : 'action.active' }}>
                  {isBookmarked ? <BookmarkIcon fontSize="inherit"/> : <BookmarkBorderIcon fontSize="inherit"/>}
                </IconButton>
              </Tooltip>
            )}
            {onClose && <Tooltip title="Close"><IconButton size="small" onClick={onClose}><CloseIcon fontSize="inherit"/></IconButton></Tooltip>}
          </Stack>
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? "fullWidth" : "scrollable"} sx={{ px: isMobile ? 0 : 2 }}>
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<CodeIcon />} iconPosition="start" label="Detection Logic" />
          <Tab icon={<DataObjectIcon />} iconPosition="start" label="Raw Data" />
        </Tabs>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Description</Typography>
          <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>{description || 'N/A'}</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Rule Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 1, rowGap: 1.5 }}>
            <DetailGridItem label="Author" value={author} />
            <DetailGridItem label="Risk Score" value={risk_score} />
            <DetailGridItem label="Interval" value={interval} />
            <DetailGridItem label="Created" value={formatDateTime(created_date)} />
            <DetailGridItem label="Modified" value={formatDateTime(modified_date)} />
            <DetailGridItem label="Status"><StatusBadge label={status || 'Unknown'} status={status?.toLowerCase()} size="small" /></DetailGridItem>
            <DetailGridItem label="Validated"><Chip icon={validationIcon} label={validationChipLabel} size="small" color={validationChipColor} variant="outlined" /></DetailGridItem>
            <DetailGridItem label="License"><Chip icon={<GavelIcon />} label={license || 'N/A'} size="small" /></DetailGridItem>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>ATT&CK Framework</Typography>
          <Stack spacing={1.5}>
              <DetailGridItem label="Tactics">
                  {tactics.map(t => <Chip icon={<BubbleChartIcon />} key={t.reference} label={t.name} size="small" component="a" href={t.reference} target="_blank" clickable sx={{bgcolor: 'info.light', color: 'info.dark'}}/>)}
              </DetailGridItem>
              <DetailGridItem label="Techniques">
                  {techniques.map(t => <Chip icon={<HubIcon />} key={t.reference} label={`${t.name} (${t.id})`} size="small" component="a" href={t.reference} target="_blank" clickable sx={{bgcolor: 'primary.light', color: 'primary.dark'}} />)}
              </DetailGridItem>
          </Stack>
          <Divider sx={{ my: 2 }} />
          
          {cves.length > 0 && <>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Related CVEs</Typography>
            <DetailGridItem label="CVEs">
                {cves.map(cveId => <Chip key={cveId} label={cveId} size="small" component="a" href={`https://www.cve.org/CVERecord?id=${cveId}`} target="_blank" clickable sx={{bgcolor: 'warning.light', color: 'warning.dark'}} />)}
            </DetailGridItem>
            <Divider sx={{ my: 2 }} />
          </>}

          <RuleTagsDisplay tags={tags} label="All Tags" />
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{display: 'flex', alignItems: 'center'}}><ArticleIcon sx={{mr: 1, color: 'text.secondary'}}/>External References</Typography>
          <Stack spacing={1}>
            {references.map((ref, i) => <Link key={i} href={ref} target="_blank" variant="body2">{ref}</Link>)}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>Detection Logic</Typography>
                <Box>
                  <Chip label={formatQueryLanguage(language)} size="small" color="primary" variant="outlined" sx={{mr:1}} />
                  <Tooltip title="Copy query"><IconButton size="small" onClick={() => handleCopyToClipboard(query, 'Query copied!')}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
            </Box>
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.common.black, 0.05), border: 1, borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '60vh', overflow: 'auto' }}>
                {query}
            </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>Raw Rule Data</Typography>
                <Tooltip title="Copy JSON"><IconButton size="small" onClick={() => handleCopyToClipboard(JSON.stringify(raw_rule, null, 2), 'Raw JSON copied!')}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.common.black, 0.05), border: 1, borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre', maxHeight: '70vh', overflow: 'auto' }}>
                {JSON.stringify(raw_rule, null, 2)}
            </Paper>
        </TabPanel>
      </Box>
      <CreateIssueModal open={isModalOpen} onClose={() => setIsModalOpen(false)} ruleId={rule.id} ruleName={rule.title} />
=======
// Tab Panel component for rule details
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
=======
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`rule-tabpanel-${index}`} aria-labelledby={`rule-tab-${index}`} {...other}>
    {value === index && <Box sx={{ py: 2, px: isMobile ? 0.5: 0 }}>{children}</Box>} {/* Adjusted padding */}
  </div>
);
=======
// isMobile needs to be defined where useMediaQuery can be called (inside a component or hook)
// We will define it inside the RuleDetail component itself.
// let isMobileGlobalScope = false; // Remove this global variable

=======
>>>>>>> 0d2fbe6 (error fixes for ruledetail)
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`rule-tabpanel-${index}`} aria-labelledby={`rule-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};
>>>>>>> 8d2984b (error fixes for ruledetail)
=======
>>>>>>> 37ba2d8 (Initial commit)

interface DetailGridItemProps {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}
<<<<<<< HEAD
<<<<<<< HEAD
const DetailGridItem: React.FC<DetailGridItemProps> = ({ label, value, children, isStatus, statusType }) => {
<<<<<<< HEAD
<<<<<<< HEAD
  if (!value && !children) return null;
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
  if (value === undefined && value === null && !children) return null; // Show if value is empty string or 0
  if (value === null && !children) value = '-'; // Display '-' for null values if no children
=======
  if (value === undefined && value === null && !children) return null;
<<<<<<< HEAD
  if (value === null && !children) value = '-';
>>>>>>> 0d2fbe6 (error fixes for ruledetail)
=======
  // Ensure value is not null for String() conversion, default to '-' if it was null
  const displayValue = value === null && !children ? '-' : value;

>>>>>>> 984e985 (backend rework for rule_platforms)

>>>>>>> 8d2984b (error fixes for ruledetail)
=======
const DetailGridItem: React.FC<DetailGridItemProps> = ({ label, value, children, isStatus, statusType, fullWidthChildren }) => {
  if (value === undefined && value === null && !children) return null;
  const displayValue = value === null && !children ? '-' : value;

>>>>>>> 2388fea (update to rule detail)
=======
const DetailGridItem: React.FC<DetailGridItemProps> = ({ label, value, children }) => {
  if (!value && !children && (!children || (Array.isArray(children) && children.length === 0))) return null;
>>>>>>> 37ba2d8 (Initial commit)
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, gridColumn: '1 / span 1', pt: 0.5, pr: 1, textAlign: 'right' }}>{label}:</Typography>
      <Box sx={{ gridColumn: '2 / -1', pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {children || <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{String(value ?? '-')}</Typography>}
      </Box>
    </>
  );
};

// --- Main Component ---

interface RuleDetailProps {
  rule: RuleDetailType | null;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
  isBookmarked = false,
  onClose,
  onBookmark,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);

  // Use the new custom hook to get parsed data
  const parsedData = useParsedRuleData(rule);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(message))
      .catch(() => toast.error("Failed to copy."));
  };

  if (!rule || !parsedData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No rule data to display.</Typography>
      </Box>
    );
  }

  const { id, title, description, rule_source, created_date, modified_date, status, raw_rule } = rule;
  const { query, language, author, references, risk_score, interval, license, tactics, techniques, cves, tags } = parsedData;
  const severity = rule.severity || 'unknown';
  const severityDisplay = SEVERITY_DISPLAY[severity as RuleSeverityEnum] || 'Unknown';
  const validation_status = raw_rule?.validation_status;

  let validationIcon = <HelpOutlineIcon fontSize="inherit" />;
  let validationChipLabel = "Unknown";
  let validationChipColor: "default" | "success" | "error" = "default";
  if (validation_status?.toLowerCase() === 'validated') {
    validationIcon = <CheckCircleOutlineIcon fontSize="inherit" />;
    validationChipLabel = "Validated";
    validationChipColor = "success";
  } else if (validation_status?.toLowerCase() === 'not_validated') {
    validationIcon = <HighlightOffIcon fontSize="inherit" />;
    validationChipLabel = "Not Validated";
    validationChipColor = "error";
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ pr: 1, overflow: 'hidden' }}>
            <Tooltip title={title}><Typography variant="h6" fontWeight="bold" noWrap gutterBottom>{title}</Typography></Tooltip>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={rule_source} size="small" />
              <StatusBadge label={severityDisplay} status={severity.toLowerCase()} size="small" />
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {onBookmark && (
              <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
                <IconButton size="small" onClick={() => onBookmark(id)} sx={{ color: isBookmarked ? 'warning.main' : 'action.active' }}>
                  {isBookmarked ? <BookmarkIcon fontSize="inherit"/> : <BookmarkBorderIcon fontSize="inherit"/>}
                </IconButton>
              </Tooltip>
            )}
            {onClose && <Tooltip title="Close"><IconButton size="small" onClick={onClose}><CloseIcon fontSize="inherit"/></IconButton></Tooltip>}
          </Stack>
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? "fullWidth" : "scrollable"} sx={{ px: isMobile ? 0 : 2 }}>
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<CodeIcon />} iconPosition="start" label="Detection Logic" />
          <Tab icon={<DataObjectIcon />} iconPosition="start" label="Raw Data" />
        </Tabs>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Description</Typography>
          <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>{description || 'N/A'}</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Rule Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 1, rowGap: 1.5 }}>
            <DetailGridItem label="Author" value={author} />
            <DetailGridItem label="Risk Score" value={risk_score} />
            <DetailGridItem label="Interval" value={interval} />
            <DetailGridItem label="Created" value={formatDateTime(created_date)} />
            <DetailGridItem label="Modified" value={formatDateTime(modified_date)} />
            <DetailGridItem label="Status"><StatusBadge label={status || 'Unknown'} status={status?.toLowerCase()} size="small" /></DetailGridItem>
            <DetailGridItem label="Validated"><Chip icon={validationIcon} label={validationChipLabel} size="small" color={validationChipColor} variant="outlined" /></DetailGridItem>
            <DetailGridItem label="License"><Chip icon={<GavelIcon />} label={license || 'N/A'} size="small" /></DetailGridItem>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>ATT&CK Framework</Typography>
          <Stack spacing={1.5}>
              <DetailGridItem label="Tactics">
                  {tactics.map(t => <Chip icon={<BubbleChartIcon />} key={t.reference} label={t.name} size="small" component="a" href={t.reference} target="_blank" clickable sx={{bgcolor: 'info.light', color: 'info.dark'}}/>)}
              </DetailGridItem>
              <DetailGridItem label="Techniques">
                  {techniques.map(t => <Chip icon={<HubIcon />} key={t.reference} label={`${t.name} (${t.id})`} size="small" component="a" href={t.reference} target="_blank" clickable sx={{bgcolor: 'primary.light', color: 'primary.dark'}} />)}
              </DetailGridItem>
          </Stack>
          <Divider sx={{ my: 2 }} />
          
          {cves.length > 0 && <>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Related CVEs</Typography>
            <DetailGridItem label="CVEs">
                {cves.map(cveId => <Chip key={cveId} label={cveId} size="small" component="a" href={`https://www.cve.org/CVERecord?id=${cveId}`} target="_blank" clickable sx={{bgcolor: 'warning.light', color: 'warning.dark'}} />)}
            </DetailGridItem>
            <Divider sx={{ my: 2 }} />
          </>}

          <RuleTagsDisplay tags={tags} label="All Tags" />
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{display: 'flex', alignItems: 'center'}}><ArticleIcon sx={{mr: 1, color: 'text.secondary'}}/>External References</Typography>
          <Stack spacing={1}>
            {references.map((ref, i) => <Link key={i} href={ref} target="_blank" variant="body2">{ref}</Link>)}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>Detection Logic</Typography>
                <Box>
                  <Chip label={formatQueryLanguage(language)} size="small" color="primary" variant="outlined" sx={{mr:1}} />
                  <Tooltip title="Copy query"><IconButton size="small" onClick={() => handleCopyToClipboard(query, 'Query copied!')}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
            </Box>
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.common.black, 0.05), border: 1, borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '60vh', overflow: 'auto' }}>
                {query}
            </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>Raw Rule Data</Typography>
                <Tooltip title="Copy JSON"><IconButton size="small" onClick={() => handleCopyToClipboard(JSON.stringify(raw_rule, null, 2), 'Raw JSON copied!')}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.common.black, 0.05), border: 1, borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre', maxHeight: '70vh', overflow: 'auto' }}>
                {JSON.stringify(raw_rule, null, 2)}
            </Paper>
        </TabPanel>
      </Box>
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======
      <CreateIssueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleId={rule.id}
        ruleName={rule.title}
      />
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
      <CreateIssueModal open={isModalOpen} onClose={() => setIsModalOpen(false)} ruleId={rule.id} ruleName={rule.title} />
>>>>>>> 37ba2d8 (Initial commit)
    </Box>
  );
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export default RuleDetail;
=======
// Helper components for the rule detail layout
interface GridProps {
  title?: string;
  children: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({ title, children }) => {
  return (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' },
          gap: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

interface GridItemProps {
  label: string;
  value: string;
  isStatus?: boolean;
}

const GridItem: React.FC<GridItemProps> = ({ label, value, isStatus = false }) => {
  if (!value) return null;
  
  return (
    <>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {label}:
      </Typography>
      {isStatus ? (
        <StatusBadge label={value} status={value.toLowerCase()} size="small" />
      ) : (
        <Typography variant="body2">{value}</Typography>
      )}
    </>
  );
};

export default RuleDetail;
>>>>>>> a380730 (Initial deployment)
=======
export default RuleDetail;
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
export default RuleDetail;
>>>>>>> 984e985 (backend rework for rule_platforms)
