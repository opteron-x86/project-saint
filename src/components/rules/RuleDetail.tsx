// src/components/rules/RuleDetail.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Divider, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
  useMediaQuery, Toolbar, Button, Alert, CircularProgress, LinearProgress,
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
  error?: any;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
  onShare?: (ruleId: string) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  ruleId,
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

  // MITRE data for tactics mapping
  const { data: mitreMatrixData } = useMitreMatrixQuery();
  const [tacticDetailsMap, setTacticDetailsMap] = useState<Record<string, { name: string; url?: string | null }>>({});

  // Store hooks
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  // Add rule to recently viewed when component loads
  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);

  // Process rule-specific data with enhanced enrichment information
  const ruleSpecifics = useMemo(() => {
    if (!rule) return null;

    const elastic = rule.elastic_details;
    const sentinel = rule.sentinel_details;
    const trinity = rule.trinitycyber_details;

    return {
      severity: rule.severity || 'unknown',
      query: elastic?.query || sentinel?.query || 'No detection logic available.',
      query_language: elastic?.language || (sentinel ? 'KQL' : 'unknown'),
      version: elastic?.version,
      license: elastic?.license,
      tags: elastic?.tags || [],
      false_positives: elastic?.false_positives || [],
      interval: elastic?.interval,
      risk_score: elastic?.risk_score,
      human_hash: trinity?.human_hash,
      cve: trinity?.cve || [],
      implementation: trinity?.implementation,
      // New enrichment data
      extracted_mitre: elastic?.extracted_mitre || sentinel?.extracted_mitre || trinity?.extracted_mitre || [],
      extracted_cves: elastic?.extracted_cves || sentinel?.extracted_cves || trinity?.extracted_cves || [],
    };
  }, [rule]);

  // Build tactics details map from MITRE matrix data
  useEffect(() => {
    if (mitreMatrixData && rule?.raw_rule?.tactics) {
      const newMap: Record<string, { name: string; url?: string | null }> = {};
      const tacticIds = (Array.isArray(rule.raw_rule.tactics) ? 
        rule.raw_rule.tactics : [rule.raw_rule.tactics]
      ) as string[];
      
      tacticIds.forEach(tacticId => {
        const foundTactic = mitreMatrixData.find(t => 
          t.id === tacticId || t.shortname === tacticId || t.stix_id === tacticId
        );
        if (foundTactic) {
          newMap[tacticId] = { name: foundTactic.name, url: foundTactic.url };
        } else {
          newMap[tacticId] = { 
            name: tacticId, 
            url: `https://attack.mitre.org/tactics/${tacticId}` 
          };
        }
      });
      setTacticDetailsMap(newMap);
    }
  }, [mitreMatrixData, rule?.raw_rule?.tactics]);

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
            error={error} 
            title="Failed to load rule details"
            message="There was an error loading the rule data."
          />
        ) : (
          <Alert severity="warning">
            No rule data available to display.
          </Alert>
        )}
      </Box>
    );
  }

  // Extract rule data with fallbacks
  const {
    id, title, description, rule_source, created_date, modified_date, author,
    linked_techniques = [],
    rule_platforms = [],
    status,
    raw_rule,
    source_file_path,
    source_rule_id,
    // New enrichment fields
    has_mitre_mapping = false,
    has_cve_references = false,
    enrichment_score = 0,
  } = rule;

  const validation_status = (raw_rule as any)?.validation_status;

  const {
    severity, query, query_language, version, risk_score, license, interval, 
    tags, false_positives, human_hash, cve, implementation,
    extracted_mitre, extracted_cves
  } = ruleSpecifics!;

  const severityDisplay = SEVERITY_DISPLAY[severity as RuleSeverityEnum] || severity || 'Unknown';
  const rawTacticsFromRule = (Array.isArray(raw_rule?.tactics) ? 
    raw_rule.tactics : raw_rule?.tactics ? [raw_rule.tactics] : []
  ) as string[];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Toolbar */}
      <Toolbar 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          gap: 1
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {rule_source} • Rule ID: {source_rule_id || id}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1}>
          {/* Enrichment Score Badge */}
          {enrichment_score > 0 && (
            <Tooltip title={`Enrichment Score: ${enrichment_score}%`}>
              <Chip
                icon={<TrendingUpIcon />}
                label={`${enrichment_score}%`}
                size="small"
                color={enrichment_score >= 75 ? 'success' : enrichment_score >= 50 ? 'warning' : 'default'}
                variant="outlined"
              />
            </Tooltip>
          )}

          {onBookmark && (
            <IconButton onClick={() => onBookmark(id)} color={isBookmarked ? 'primary' : 'default'}>
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          )}

          {onShare && (
            <IconButton onClick={() => onShare(id)}>
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
                <DetailGridItem label="Source File" value={source_file_path} />
                <DetailGridItem label="Created" value={created_date ? formatDateTime(created_date) : null} />
                <DetailGridItem label="Modified" value={modified_date ? formatDateTime(modified_date) : null} />
                
                {/* Rule Platforms */}
                <DetailGridItem label="Rule Platforms" fullWidthChildren>
                  {rule_platforms.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {rule_platforms.map(platform => (
                        <Chip key={platform} label={platform} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </DetailGridItem>

                {/* Tags */}
                {tags.length > 0 && (
                  <DetailGridItem label="Tags" fullWidthChildren>
                    <RuleTagsDisplay tags={tags} />
                  </DetailGridItem>
                )}

                {/* False Positives */}
                {false_positives.length > 0 && (
                  <DetailGridItem label="False Positives" fullWidthChildren>
                    <Stack spacing={1}>
                      {false_positives.map((fp, index) => (
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
            {implementation ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Implementation Details
                  </Typography>
                  <Tooltip title="Copy Implementation JSON">
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyToClipboard(JSON.stringify(implementation, null, 2), 'Implementation JSON copied!')}
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
                  {JSON.stringify(implementation, null, 2)}
                </Paper>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Detection Logic ({query_language ? formatQueryLanguage(query_language) : 'N/A'})
                  </Typography>
                  <Box>
                    {query_language && (
                      <Chip 
                        label={formatQueryLanguage(query_language)} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }} 
                      />
                    )}
                    <Tooltip title="Copy query">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(query, 'Query copied to clipboard!')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
                    whiteSpace: 'pre-wrap',
                    maxHeight: '70vh'
                  }}
                >
                  {query}
                </Paper>
              </>
            )}
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
                  onClick={() => handleCopyToClipboard(JSON.stringify(raw_rule, null, 2), 'Raw data copied!')}
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
              {JSON.stringify(raw_rule, null, 2)}
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
                {linked_techniques.length > 0 ? (
                  <Stack spacing={1}>
                    {linked_techniques.map(technique => (
                      <Chip
                        key={technique.id}
                        label={`${technique.id}: ${technique.name}`}
                        clickable
                        component="a"
                        href={technique.url || `https://attack.mitre.org/techniques/${technique.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>
                ) : extracted_mitre && extracted_mitre.length > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Extracted from rule content:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {extracted_mitre.map(techniqueId => (
                        <Chip
                          key={techniqueId}
                          label={techniqueId}
                          clickable
                          component="a"
                          href={`https://attack.mitre.org/techniques/${techniqueId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No MITRE ATT&CK techniques mapped to this rule.
                  </Typography>
                )}
              </Box>

              {/* MITRE Tactics */}
              {rawTacticsFromRule.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BubbleChartIcon /> MITRE ATT&CK Tactics
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {rawTacticsFromRule.map(tacticId => {
                      const tacticDetails = tacticDetailsMap[tacticId];
                      return (
                        <Chip
                          key={tacticId}
                          label={tacticDetails?.name || tacticId}
                          clickable
                          component="a"
                          href={tacticDetails?.url || `https://attack.mitre.org/tactics/${tacticId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          color="secondary"
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* CVE References */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  CVE References
                </Typography>
                {cve.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {cve.map(cveId => (
                      <Chip
                        key={cveId}
                        label={cveId}
                        clickable
                        component="a"
                        href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="warning"
                      />
                    ))}
                  </Stack>
                ) : extracted_cves && extracted_cves.length > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Extracted from rule content:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {extracted_cves.map(cveId => (
                        <Chip
                          key={cveId}
                          label={cveId}
                          clickable
                          component="a"
                          href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No CVE references found for this rule.
                  </Typography>
                )}
              </Box>
            </Stack>
          </TabPanel>
        </Box>
      </Box>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleId={id}
        ruleTitle={title}
      />
    </Box>
  );
};

export default RuleDetail;