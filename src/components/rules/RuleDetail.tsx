// src/components/rules/RuleDetail.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
  useMediaQuery, Toolbar, Alert, LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HubIcon from '@mui/icons-material/Hub';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';

// API and Types
import { RuleDetail as RuleDetailType, RuleSeverity as RuleSeverityEnum } from '../../api/types';
import { useMitreMatrixQuery } from '@/api/queries';
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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`rule-tabpanel-${index}`} aria-labelledby={`rule-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

interface DetailGridItemProps {
  label: string;
  value?: string | number | boolean | null;
  children?: React.ReactNode;
  isStatus?: boolean;
  statusType?: string;
  fullWidthChildren?: boolean;
}

const DetailGridItem: React.FC<DetailGridItemProps> = ({ 
  label, 
  value, 
  children, 
  isStatus, 
  statusType, 
  fullWidthChildren 
}) => {
  if (value === undefined && value === null && !children) return null;
  const displayValue = value === null && !children ? '-' : value;

  return (
    <>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          fontWeight: 500, 
          gridColumn: '1 / span 1', 
          pt: 0.5, 
          pr: 1, 
          textAlign: 'right' 
        }}
      >
        {label}:
      </Typography>
      <Box sx={{ 
        gridColumn: fullWidthChildren ? '2 / -1' : '2 / span 1', 
        pt: 0.5, 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 0.5 
      }}>
        {isStatus ? (
          <StatusBadge 
            label={String(displayValue ?? 'Unknown')} 
            status={statusType || String(displayValue ?? 'unknown').toLowerCase()} 
            size="small" 
          />
        ) : children ? (
          children
        ) : (
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {String(displayValue ?? '-')}
          </Typography>
        )}
      </Box>
    </>
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
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // MITRE data for tactics mapping
  const { data: mitreMatrixData } = useMitreMatrixQuery();

  // Store hooks
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  // Add rule to recently viewed when component loads
  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);

  // Process rule-specific data - FIXED to handle actual API response format
  const ruleSpecifics = useMemo(() => {
    if (!rule) return null;

    // Handle the actual API response structure
    const rawRule = rule.raw_rule || {};
    const metadata = rule.rule_metadata || {};
    
    // Extract query from raw_rule (for Elastic rules) or rule_content
    let query = 'No detection logic available.';
    let queryLanguage = 'unknown';
    
    if (rawRule && rawRule.query) {
      query = rawRule.query;
      queryLanguage = rawRule.language || 'kuery';
    } else if (rule.rule_content && typeof rule.rule_content === 'string') {
      try {
        const parsedContent = JSON.parse(rule.rule_content);
        query = parsedContent.query || 'No detection logic available.';
        queryLanguage = parsedContent.language || 'kuery';
      } catch (e) {
        console.error('Failed to parse rule_content:', e);
        // If parsing fails, just show the raw content
        query = rule.rule_content || 'No detection logic available.';
      }
    }

    return {
      severity: rule.severity || 'unknown',
      query,
      query_language: queryLanguage,
      version: rawRule.version || metadata?.version,
      license: rawRule.license || metadata?.license || '',
      tags: rule.tags || rawRule.tags || [],
      false_positives: rawRule.false_positives || metadata?.false_positives || [],
      interval: rawRule.interval || metadata?.interval,
      risk_score: rawRule.risk_score || metadata?.risk_score,
      author: rawRule.author || metadata?.author,
      references: rawRule.references || metadata?.references || [],
      // Extract from metadata if available
      platforms: metadata?.rule_platforms || [],
      from: rawRule.from || metadata?.from,
      to: rawRule.to || metadata?.to,
      index: rawRule.index || metadata?.index || [],
      filters: rawRule.filters || metadata?.filters || [],
    };
  }, [rule]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message);
    }).catch(err => {
      toast.error("Failed to copy to clipboard.");
      console.error("Failed to copy to clipboard:", err);
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LoadingIndicator size={24} />
            <Typography variant="h6">Loading rule details...</Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <LinearProgress />
      </Box>
    );
  }

  // Error state
  if (isError || !rule) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Error Loading Rule</Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        {isError && error ? (
          <ErrorDisplay 
            title="Failed to load rule details"
            message={error.message || "There was an error loading the rule data."}
          />
        ) : (
          <Alert severity="warning">
            No rule data available to display.
          </Alert>
        )}
      </Box>
    );
  }

  // Extract rule data with fallbacks - FIXED to handle actual API response
  const {
    id, 
    title, 
    description, 
    source,
    created_date, 
    modified_date, 
    rule_platforms = [],
    is_active,
    raw_rule,
    mitre_techniques = [], // Use actual API field name
    cves = [],
    tags = [],
    validation_status,
    has_mitre_mapping = false,
    has_cve_references = false,
    enrichment_score = 0,
  } = rule;

  console.log('MITRE techniques from API:', mitre_techniques); // Debug log
  console.log('CVEs from API:', cves); // Debug log
  console.log('Raw rule from API:', raw_rule); // Debug log

  // Get author from multiple possible locations
  const author = ruleSpecifics?.author || 
    (Array.isArray(rule.rule_metadata?.author) ? rule.rule_metadata.author.join(', ') : rule.rule_metadata?.author) ||
    (raw_rule && Array.isArray(raw_rule.author) ? raw_rule.author.join(', ') : raw_rule?.author);

  const {
    severity, query, query_language, version, risk_score, license, interval, 
    false_positives, references, platforms, from, to, index, filters
  } = ruleSpecifics!;

  const severityDisplay = SEVERITY_DISPLAY[severity as RuleSeverityEnum] || severity || 'Unknown';
  const status = is_active ? 'active' : 'inactive';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar sx={{ borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {title || 'Unnamed Rule'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {source?.name || 'Unknown Source'} • {id}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
          {/* Enrichment Score Badge */}
          {enrichment_score > 0 && (
            <Tooltip title={`Enrichment Score: ${enrichment_score}%`}>
              <Chip
                label={`${enrichment_score}% Enriched`}
                size="small"
                color={enrichment_score >= 75 ? 'success' : enrichment_score >= 50 ? 'warning' : 'default'}
                variant="outlined"
              />
            </Tooltip>
          )}

          {onBookmark && (
            <IconButton onClick={() => onBookmark(String(id))} color={isBookmarked ? 'primary' : 'default'}>
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          )}

          {onShare && (
            <IconButton onClick={() => onShare(String(id))}>
              <ShareIcon />
            </IconButton>
          )}

          <IconButton onClick={() => setIsModalOpen(true)}>
            <BugReportIcon />
          </IconButton>

          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </Toolbar>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}
        >
          <Tab icon={<InfoIcon />} label="Overview" />
          <Tab icon={<CodeIcon />} label="Detection" />
          <Tab icon={<DataObjectIcon />} label="Raw Data" />
          <Tab icon={<SecurityIcon />} label="MITRE & CVE" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              {/* Enrichment Status */}
              {(has_mitre_mapping || has_cve_references || enrichment_score > 0) && (
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="success" />
                    Enrichment Status
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {has_mitre_mapping && (
                      <Chip label="MITRE Mapped" color="success" size="small" />
                    )}
                    {has_cve_references && (
                      <Chip label="CVE References" color="success" size="small" />
                    )}
                    <Chip 
                      label={`${enrichment_score}% Enriched`} 
                      color={enrichment_score >= 75 ? 'success' : enrichment_score >= 50 ? 'warning' : 'default'}
                      size="small" 
                    />
                  </Stack>
                </Paper>
              )}

              {/* Basic Information */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, alignItems: 'start' }}>
                <DetailGridItem label="Description" value={description} fullWidthChildren />
                <DetailGridItem label="Severity" value={severityDisplay} isStatus statusType={severity} />
                <DetailGridItem label="Status" value={status} isStatus />
                <DetailGridItem label="Validation" value={validation_status} isStatus />
                <DetailGridItem label="Author" value={author} />
                <DetailGridItem label="Version" value={version} />
                <DetailGridItem label="Risk Score" value={risk_score} />
                <DetailGridItem label="License" value={license} />
                <DetailGridItem label="Interval" value={interval} />
                <DetailGridItem label="From" value={from} />
                <DetailGridItem label="To" value={to} />
                <DetailGridItem label="Created" value={created_date ? formatDateTime(created_date) : null} />
                <DetailGridItem label="Modified" value={modified_date ? formatDateTime(modified_date) : null} />
                
                {/* Rule Platforms */}
                <DetailGridItem label="Rule Platforms" fullWidthChildren>
                  {rule_platforms && rule_platforms.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {rule_platforms.map((platform: string) => (
                        <Chip key={platform} label={platform} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </DetailGridItem>

                {/* Technique Platforms */}
                {platforms && platforms.length > 0 && (
                  <DetailGridItem label="Technique Platforms" fullWidthChildren>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {platforms.map((platform: string) => (
                        <Chip key={platform} label={platform} size="small" variant="outlined" color="secondary" />
                      ))}
                    </Stack>
                  </DetailGridItem>
                )}

                {/* Index */}
                {index && index.length > 0 && (
                  <DetailGridItem label="Index Patterns" fullWidthChildren>
                    <Stack spacing={0.5}>
                      {index.map((idx: string, i: number) => (
                        <Typography key={i} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {idx}
                        </Typography>
                      ))}
                    </Stack>
                  </DetailGridItem>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <DetailGridItem label="Tags" fullWidthChildren>
                    <RuleTagsDisplay tags={tags} />
                  </DetailGridItem>
                )}

                {/* References */}
                {references && references.length > 0 && (
                  <DetailGridItem label="References" fullWidthChildren>
                    <Stack spacing={0.5}>
                      {references.map((ref: string, index: number) => (
                        <Link key={index} href={ref} target="_blank" rel="noopener noreferrer" variant="body2">
                          {ref}
                        </Link>
                      ))}
                    </Stack>
                  </DetailGridItem>
                )}

                {/* False Positives */}
                {false_positives && false_positives.length > 0 && (
                  <DetailGridItem label="False Positives" fullWidthChildren>
                    <Stack spacing={1}>
                      {false_positives.map((fp: string, index: number) => (
                        <Typography key={index} variant="body2" sx={{ fontStyle: 'italic' }}>
                          • {fp}
                        </Typography>
                      ))}
                    </Stack>
                  </DetailGridItem>
                )}
              </Box>
            </Stack>
          </TabPanel>

          {/* Detection Tab */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon /> Detection Logic ({formatQueryLanguage(query_language)})
                </Typography>
                <Tooltip title="Copy query">
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(query, 'Query copied!')}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {query !== 'No detection logic available.' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 
                      alpha(theme.palette.common.black, 0.3) : 
                      alpha(theme.palette.grey[900], 0.03),
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    borderRadius: 1,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '70vh'
                  }}
                >
                  {query}
                </Paper>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No detection logic available for this rule.
                </Alert>
              )}

              {/* Filters if available */}
              {filters && filters.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Filters
                    </Typography>
                    <Tooltip title="Copy filters">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(JSON.stringify(filters, null, 2), 'Filters copied!')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 
                        alpha(theme.palette.common.black, 0.3) : 
                        alpha(theme.palette.grey[900], 0.03),
                      border: `1px solid ${theme.palette.divider}`,
                      fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      borderRadius: 1,
                      overflowX: 'auto',
                      whiteSpace: 'pre',
                      maxHeight: '30vh'
                    }}
                  >
                    {JSON.stringify(filters, null, 2)}
                  </Paper>
                </>
              )}
            </Stack>
          </TabPanel>

          {/* Raw Data Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Raw Rule Data
              </Typography>
              <Tooltip title="Copy raw data">
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(
                    raw_rule ? JSON.stringify(raw_rule, null, 2) : 'No raw rule data available', 
                    'Raw data copied!'
                  )}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 
                  alpha(theme.palette.common.black, 0.3) : 
                  alpha(theme.palette.grey[900], 0.03),
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                borderRadius: 1,
                overflowX: 'auto',
                whiteSpace: 'pre',
                maxHeight: '70vh'
              }}
            >
              {raw_rule ? JSON.stringify(raw_rule, null, 2) : (
                <Alert severity="info">
                  No raw rule data available for this rule.
                </Alert>
              )}
            </Paper>
          </TabPanel>

          {/* MITRE & CVE Tab */}
          <TabPanel value={tabValue} index={3}>
            <Stack spacing={3}>
              {/* MITRE Techniques */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HubIcon /> MITRE ATT&CK Techniques
                </Typography>
                {mitre_techniques && mitre_techniques.length > 0 ? (
                  <Stack spacing={1}>
                    {mitre_techniques.map((technique, index) => (
                      <Chip
                        key={technique.technique_id || index}
                        label={`${technique.technique_id}: ${technique.name}`}
                        clickable
                        component="a"
                        href={`https://attack.mitre.org/techniques/${technique.technique_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="primary"
                        size="medium"
                        sx={{ 
                          justifyContent: 'flex-start',
                          '& .MuiChip-label': { 
                            overflow: 'visible',
                            textOverflow: 'clip',
                            whiteSpace: 'normal'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No MITRE ATT&CK techniques mapped to this rule.
                  </Typography>
                )}
              </Box>

              {/* CVE References */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BubbleChartIcon /> CVE References
                </Typography>
                {cves && cves.length > 0 ? (
                  <Stack spacing={1}>
                    {cves.map((cve, index) => (
                      <Chip
                        key={cve.id || cve.cve_id || index}
                        label={`${cve.cve_id}: ${cve.description || 'No description available'}`}
                        clickable
                        component="a"
                        href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="warning"
                        size="medium"
                        sx={{ 
                          justifyContent: 'flex-start',
                          '& .MuiChip-label': { 
                            overflow: 'visible', 
                            textOverflow: 'clip',
                            whiteSpace: 'normal'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No CVE references found for this rule.
                  </Typography>
                )}
              </Box>

              {/* Tactics from threat data */}
              {raw_rule?.threat && Array.isArray(raw_rule.threat) && raw_rule.threat.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon /> MITRE ATT&CK Tactics
                  </Typography>
                  <Stack spacing={1}>
                    {raw_rule.threat.map((threat: any, index: number) => (
                      threat.tactic && (
                        <Chip
                          key={`${threat.tactic.id}-${index}`}
                          label={`${threat.tactic.id}: ${threat.tactic.name}`}
                          clickable
                          component="a"
                          href={threat.tactic.reference || `https://attack.mitre.org/tactics/${threat.tactic.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          color="secondary"
                          size="medium"
                        />
                      )
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </TabPanel>
        </Box>
      </Box>

      {/* Create Issue Modal */}
      <CreateIssueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleId={String(id)}
        ruleName={title || 'Unnamed Rule'}
      />
    </Box>
  );
};

export default RuleDetail;