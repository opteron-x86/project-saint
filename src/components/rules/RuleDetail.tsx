// src/components/rules/RuleDetail.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Link,
  useTheme,
  Paper,
  useMediaQuery,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HubIcon from '@mui/icons-material/Hub';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DevicesIcon from '@mui/icons-material/Devices';
import toast from 'react-hot-toast';

// API and Types
import { RuleDetail as RuleDetailType } from '../../api/types';
import { useRuleStore } from '@/store';

// Components
import { StatusBadge, LoadingIndicator, ErrorDisplay } from '../common';
import { formatDateTime, formatQueryLanguage } from '../../utils/format';
import { SEVERITY_DISPLAY } from '../../utils/constants';
import RuleTagsDisplay from './RuleTagsDisplay';
import { CreateIssueModal } from './CreateIssueModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rule-tabpanel-${index}`}
      aria-labelledby={`rule-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

interface RuleDetailProps {
  ruleId?: string | null;
  rule?: RuleDetailType | null;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
  onShare?: (ruleId: string) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
  isLoading = false,
  isError = false,
  error,
  isBookmarked = false,
  onClose,
  onBookmark,
  onShare,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Store hooks
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  // Add rule to recently viewed when component loads
  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);

  // Process rule data
  const processedRule = useMemo(() => {
    if (!rule) return null;

    const rawRule = rule.raw_rule || {};
    const metadata = (rule as Record<string, unknown>).rule_metadata as Record<string, unknown> || {};
    
    return {
      ...rule,
      // Primary fields
      title: rawRule.name || rule.title || 'Untitled Rule',
      description: rawRule.description || rule.description || 'No description available',
      severity: rawRule.severity || rule.severity || 'unknown',
      author: rawRule.author || metadata.author || rule.author || 'Unknown',
      version: rawRule.version || metadata.version,
      license: rawRule.license || metadata.license,
      
      // Query and detection
      query: rawRule.query || (rule as Record<string, unknown>).rule_content || 'No detection logic available',
      language: rawRule.language || metadata.language || 'unknown',
      
      // Timing
      interval: rawRule.interval || metadata.interval,
      from: rawRule.from || metadata.from,
      to: rawRule.to || metadata.to,
      
      // Arrays
      index: rawRule.index || metadata.index || [],
      references: rawRule.references || metadata.references || [],
      tags: (() => {
        const rawTags = rawRule.tags || metadata.tags || rule.tags || [];
        return rawTags.map((tag: string | { value?: string }) => {
          if (typeof tag === 'string') return tag;
          if (tag && typeof tag === 'object' && tag.value) return tag.value;
          return String(tag);
        });
      })(),
      
      // Risk and scoring
      risk_score: rawRule.risk_score || metadata.risk_score,
      max_signals: rawRule.max_signals || metadata.max_signals,
      
      // Status
      enabled: rawRule.enabled ?? (rule as Record<string, unknown>).is_active ?? true,
      validation_status: (rule as Record<string, unknown>).validation_status || 'unknown',
      
      // Enrichment
      enrichment_score: rule.enrichment_score || 0,
      has_mitre_mapping: rule.has_mitre_mapping || false,
      has_cve_references: rule.has_cve_references || false,
      linked_techniques: rule.mitre_techniques || rule.linked_techniques || [],
      cve_references: rule.cves || rule.cve_references || [],
      related_rules: rule.related_rules || [],
    };
  }, [rule]);

  const handleCopyQuery = () => {
    if (processedRule?.query) {
      navigator.clipboard.writeText(processedRule.query);
      toast.success('Query copied to clipboard');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
        <LoadingIndicator message="Loading rule details..." />
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay 
          message="Failed to load rule details" 
          details={error?.message}
        />
      </Box>
    );
  }

  // No rule selected
  if (!processedRule) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Select a rule to view details</Alert>
      </Box>
    );
  }

  const severityDisplay = SEVERITY_DISPLAY[processedRule.severity.toLowerCase()] || processedRule.severity;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Title */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {processedRule.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <StatusBadge 
                label={severityDisplay} 
                status={processedRule.severity.toLowerCase()} 
                size="small"
              />
              {processedRule.rule_source && (
                <Chip label={processedRule.rule_source} size="small" variant="outlined" />
              )}
              {processedRule.enrichment_score > 0 && (
                <Chip
                  label={`${processedRule.enrichment_score}% Enriched`}
                  size="small"
                  color={processedRule.enrichment_score >= 75 ? 'success' : 'default'}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
          
          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            {onBookmark && (
              <IconButton onClick={() => onBookmark(String(processedRule.id))} size="small">
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            )}
            {onShare && (
              <IconButton onClick={() => onShare(String(processedRule.id))} size="small">
                <ShareIcon />
              </IconButton>
            )}
            <IconButton onClick={() => setIsModalOpen(true)} size="small">
              <BugReportIcon />
            </IconButton>
            {onClose && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}
      >
        <Tab icon={<InfoOutlinedIcon />} iconPosition="start" label="Overview" />
        <Tab icon={<CodeIcon />} iconPosition="start" label="Detection Logic" />
        <Tab icon={<HubIcon />} iconPosition="start" label="Relationships" />
        <Tab icon={<DataObjectIcon />} iconPosition="start" label="Metadata" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* Description */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">
                {processedRule.description}
              </Typography>
            </Paper>

            {/* Enrichment Status */}
            {(processedRule.has_mitre_mapping || processedRule.has_cve_references) && (
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUpIcon color="success" fontSize="small" />
                  <Typography variant="subtitle2">Enrichment Status</Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {processedRule.has_mitre_mapping && (
                    <Chip 
                      label={`${processedRule.linked_techniques?.length || 0} MITRE Techniques`}
                      color="success" 
                      size="small"
                    />
                  )}
                  {processedRule.has_cve_references && (
                    <Chip 
                      label={`${processedRule.cve_references?.length || 0} CVE References`}
                      color="success" 
                      size="small"
                    />
                  )}
                  <Chip 
                    label={`${processedRule.enrichment_score}% Complete`}
                    color={processedRule.enrichment_score >= 75 ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>
                {processedRule.enrichment_score < 100 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    This rule could benefit from additional enrichment to improve detection coverage.
                  </Typography>
                )}
              </Paper>
            )}

            {/* Rule Information */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Rule Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Author</Typography>
                  <Typography variant="body2">{processedRule.author || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Version</Typography>
                  <Typography variant="body2">{processedRule.version || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">License</Typography>
                  <Typography variant="body2">{processedRule.license || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                  <Typography variant="body2">{processedRule.risk_score || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Max Signals</Typography>
                  <Typography variant="body2">{processedRule.max_signals || '-'}</Typography>
                </Box>
                {processedRule.interval && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Run Interval</Typography>
                    <Typography variant="body2">{processedRule.interval}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Platform Coverage */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <DevicesIcon fontSize="small" />
                <Typography variant="subtitle2" color="primary">Platform Coverage</Typography>
              </Stack>
              {(processedRule.rule_platforms?.length || processedRule.platforms?.length) ? (
                <Stack spacing={1}>
                  {processedRule.rule_platforms?.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Rule Platforms</Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {processedRule.rule_platforms.map((platform: string) => (
                          <Chip key={platform} label={platform} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {processedRule.platforms?.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">MITRE Platforms</Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {processedRule.platforms.map((platform: string) => (
                          <Chip key={platform} label={platform} size="small" variant="outlined" color="secondary" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No platform information available
                </Typography>
              )}
            </Paper>

            {/* Timeline */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="subtitle2" color="primary">Timeline</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2">
                    {processedRule.created_date ? formatDateTime(processedRule.created_date) : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Modified</Typography>
                  <Typography variant="body2">
                    {processedRule.modified_date ? formatDateTime(processedRule.modified_date) : '-'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Tags */}
            {processedRule.tags && processedRule.tags.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Tags
                </Typography>
                <RuleTagsDisplay tags={processedRule.tags} />
              </Paper>
            )}
          </Stack>
        </TabPanel>

        {/* Detection Logic Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            {/* Query */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" color="primary">
                    Detection Query
                  </Typography>
                  <Chip label={formatQueryLanguage(processedRule.language)} size="small" variant="outlined" />
                </Stack>
                <IconButton onClick={handleCopyQuery} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', maxHeight: 400, overflow: 'auto' }}>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: 'grey.100',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    m: 0
                  }}
                >
                  {processedRule.query}
                </Typography>
              </Paper>
            </Paper>

            {/* Index Patterns */}
            {processedRule.index && processedRule.index.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Index Patterns
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {processedRule.index.map((idx: string, i: number) => (
                    <Chip key={i} label={idx} variant="outlined" size="small" />
                  ))}
                </Stack>
              </Paper>
            )}

            {/* References */}
            {processedRule.references && processedRule.references.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  References
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {processedRule.references.map((ref: string, i: number) => (
                    <Link key={i} href={ref} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                      {ref}
                    </Link>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </TabPanel>

        {/* Relationships Tab */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            {/* MITRE Techniques */}
            {processedRule.linked_techniques && processedRule.linked_techniques.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <SecurityIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="primary">
                    MITRE ATT&CK Techniques ({processedRule.linked_techniques.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {processedRule.linked_techniques.map((technique: any) => (
                    <Paper key={technique.technique_id || technique.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {technique.technique_id}: {technique.name}
                          </Typography>
                          {technique.mapping_source && (
                            <Typography variant="caption" color="text.secondary">
                              Source: {technique.mapping_source}
                            </Typography>
                          )}
                        </Box>
                        {technique.mapping_confidence && (
                          <Chip 
                            label={`${(technique.mapping_confidence * 100).toFixed(0)}%`}
                            size="small"
                            color={technique.mapping_confidence >= 0.8 ? 'success' : technique.mapping_confidence >= 0.6 ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* CVE References */}
            {processedRule.cve_references && processedRule.cve_references.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <BugReportIcon color="error" fontSize="small" />
                  <Typography variant="subtitle2" color="primary">
                    CVE References ({processedRule.cve_references.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {processedRule.cve_references.map((cve: any, index: number) => (
                    <Paper key={cve.cve_id || cve.id || index} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cve.cve_id || cve.id || cve}
                        </Typography>
                        {cve.cvss_score && (
                          <Chip 
                            label={`CVSS: ${cve.cvss_score}`}
                            size="small"
                            color={cve.cvss_score >= 7 ? 'error' : cve.cvss_score >= 4 ? 'warning' : 'default'}
                          />
                        )}
                      </Stack>
                      {cve.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {cve.description}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Related Rules */}
            {processedRule.related_rules && processedRule.related_rules.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Related Rules ({processedRule.related_rules.length})
                </Typography>
                <Stack spacing={1}>
                  {processedRule.related_rules.map((relatedRule: { id: string; title: string; severity?: string; rule_source?: string }) => (
                    <Paper key={relatedRule.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {relatedRule.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        {relatedRule.severity && (
                          <Chip label={relatedRule.severity} size="small" variant="outlined" />
                        )}
                        {relatedRule.rule_source && (
                          <Chip label={relatedRule.rule_source} size="small" variant="outlined" />
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Empty State */}
            {!processedRule.linked_techniques?.length && 
             !processedRule.cve_references?.length && 
             !processedRule.related_rules?.length && (
              <Alert severity="info">
                No relationships found for this rule. Consider enriching the rule with MITRE ATT&CK mappings or CVE references.
              </Alert>
            )}
          </Stack>
        </TabPanel>

        {/* Metadata Tab */}
        <TabPanel value={tabValue} index={3}>
          <Stack spacing={2}>
            {/* Source Information */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Source Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Rule ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {processedRule.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Source Rule ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {processedRule.source_rule_id || '-'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary">Source File</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {processedRule.source_file_path || '-'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Raw Rule Data */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Raw Rule Data
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowRawData(!showRawData)}
                  endIcon={showRawData ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showRawData ? 'Hide' : 'Show'}
                </Button>
              </Stack>
              {showRawData && (
                <Paper sx={{ p: 2, bgcolor: 'grey.900', maxHeight: 400, overflow: 'auto' }}>
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'grey.100',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      m: 0
                    }}
                  >
                    {JSON.stringify(processedRule.raw_rule || processedRule, null, 2)}
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Stack>
        </TabPanel>
      </Box>

      {/* Create Issue Modal */}
      {isModalOpen && (
        <CreateIssueModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ruleId={String(processedRule.id)}
          ruleName={processedRule.title}
        />
      )}
    </Box>
  );
};

export default RuleDetail;