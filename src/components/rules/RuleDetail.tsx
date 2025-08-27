// src/components/rules/RuleDetail.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Link,
  Divider,
  Button,
  Alert,
  Grid,
  Tabs,
  Tab,
  Slider,
  FormControlLabel,
  Switch,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VerifiedIcon from '@mui/icons-material/Verified';
import { RuleDetail as RuleDetailType, MitreTechnique, CveData } from '@/api/types';
import { StatusBadge, LoadingIndicator, ErrorDisplay } from '@/components/common';
import { formatDate } from '@/utils/format';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

interface RuleDetailProps {
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
  const [confidenceThreshold, setConfidenceThreshold] = useState(1.0);
  const [showAllTechniques, setShowAllTechniques] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metadata: true,
    technical: false,
    references: false,
  });

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const filteredTechniques = useMemo(() => {
    if (!rule?.mitre_techniques) return [];
    if (showAllTechniques) return rule.mitre_techniques;
    return rule.mitre_techniques.filter(t => 
      (t.confidence ?? 1.0) >= confidenceThreshold
    );
  }, [rule?.mitre_techniques, confidenceThreshold, showAllTechniques]);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: theme.palette.error.main,
      high: theme.palette.warning.main,
      medium: theme.palette.info.main,
      low: theme.palette.success.main,
    };
    return colors[severity?.toLowerCase()] || theme.palette.grey[500];
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return theme.palette.error.main;
    if (score >= 7.0) return theme.palette.warning.main;
    if (score >= 4.0) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Helper to get technique ID from MitreTechnique object
  const getTechniqueId = (technique: MitreTechnique): string => {
    return technique.technique_id || technique.id;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <LoadingIndicator size={40} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay message={error?.message || 'Failed to load rule'} />
      </Box>
    );
  }

  if (!rule) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {rule.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip 
                label={rule.severity} 
                size="small" 
                sx={{ 
                  bgcolor: getSeverityColor(rule.severity),
                  color: 'white',
                }}
              />
              {rule.siem_platform && (
                <Chip label={rule.siem_platform} size="small" variant="outlined" />
              )}
              {rule.aor && (
                <Chip label={rule.aor} size="small" variant="outlined" />
              )}
              {rule.info_controls && (
                <Chip 
                  icon={<WarningIcon />}
                  label={rule.info_controls} 
                  size="small" 
                  color="warning"
                />
              )}
              {rule.validation?.validated && (
                <Chip 
                  icon={<VerifiedIcon />}
                  label="Validated" 
                  size="small" 
                  color="success"
                />
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => onBookmark?.(rule.id)}>
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <IconButton size="small" onClick={() => onShare?.(rule.id)}>
              <ShareIcon />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2 }}>
        <Tab label="Overview" />
        <Tab label="Technical" />
        <Tab label="Enrichment" />
        <Tab label="Raw" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            {/* Description */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" color="text.secondary">
                {rule.description}
              </Typography>
            </Paper>

            {/* Metadata Section */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Metadata</Typography>
                <IconButton size="small" onClick={() => toggleSection('metadata')}>
                  {expandedSections.metadata ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>
              <Collapse in={expandedSections.metadata}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Source</Typography>
                    <Typography variant="body2">{rule.rule_source}</Typography>
                  </Grid>
                  {rule.source_org && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Organization</Typography>
                      <Typography variant="body2">{rule.source_org}</Typography>
                    </Grid>
                  )}
                  {rule.author && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Author</Typography>
                      <Typography variant="body2">{rule.author}</Typography>
                    </Grid>
                  )}
                  {rule.hunt_id && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Hunt ID</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {rule.hunt_id}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(rule.hunt_id!)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="body2">
                      {rule.created_date ? formatDate(rule.created_date) : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Modified</Typography>
                    <Typography variant="body2">
                      {rule.modified_date ? formatDate(rule.modified_date) : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>

            {/* Data Sources */}
            {rule.data_sources && rule.data_sources.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Data Sources</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {rule.data_sources.map((source) => (
                    <Chip key={source} label={source} size="small" />
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </TabPanel>

        {/* Technical Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            {/* Detection Logic */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Detection Logic</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 1,
                border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, Monaco, monospace',
                fontSize: '0.875rem',
                minHeight: 200,
                maxHeight: 400,
                overflowY: 'auto',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  width: 8,
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: theme.palette.mode === 'dark' ? '#555' : '#999',
                  borderRadius: 1,
                },
              }}>
                <pre style={{ 
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#212121',
                }}>
                  {(() => {
                    // Extract query from various possible locations
                    if (rule.raw_rule?.query) return rule.raw_rule.query;
                    if (rule.query) return rule.query;
                    if (rule.rule_content) {
                      try {
                        const parsed = JSON.parse(rule.rule_content);
                        if (parsed.query) return parsed.query;
                      } catch {
                        // Silently ignore JSON parse errors
                      }
                    }
                    return 'No detection logic available';
                  })()}
                </pre>
              </Box>
            </Paper>

            {/* Technical Details */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">Rule Type</Typography>
                  <Typography variant="body2">{rule.rule_type || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">Language</Typography>
                  <Typography variant="body2">{rule.language || rule.rule_metadata?.language as string || '-'}</Typography>
                </Grid>
                {rule.index && rule.index.length > 0 && (
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">Indices</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {rule.index.map((idx) => (
                        <Chip key={idx} label={idx} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Grid>
                )}
                {rule.raw_rule?.interval && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Run Interval</Typography>
                    <Typography variant="body2">{rule.raw_rule.interval}</Typography>
                  </Grid>
                )}
                {rule.raw_rule?.from && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Query Window</Typography>
                    <Typography variant="body2">{rule.raw_rule.from} to {rule.raw_rule?.to || 'now'}</Typography>
                  </Grid>
                )}
                {rule.raw_rule?.risk_score !== undefined && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                    <Typography variant="body2">{rule.raw_rule.risk_score}/100</Typography>
                  </Grid>
                )}
                {rule.raw_rule?.max_signals && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Max Signals</Typography>
                    <Typography variant="body2">{rule.raw_rule.max_signals}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Stack>
        </TabPanel>

        {/* Enrichment Tab */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            {/* MITRE ATT&CK */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                MITRE ATT&CK Techniques
              </Typography>
              
              {/* Redesigned controls section */}
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
              }}>
                <Stack spacing={2}>
                  {/* Confidence Slider - Always visible */}
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color={showAllTechniques ? "text.disabled" : "text.primary"}>
                        Confidence Threshold: {confidenceThreshold.toFixed(1)}
                      </Typography>
                      <Chip 
                        label={`${filteredTechniques.length} techniques`}
                        size="small"
                        color={showAllTechniques ? "default" : "primary"}
                        variant="outlined"
                      />
                    </Stack>
                    <Slider
                      value={confidenceThreshold}
                      onChange={(_, v) => setConfidenceThreshold(v as number)}
                      min={0}
                      max={1}
                      step={0.1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 0.5, label: '0.5' },
                        { value: 1, label: '1.0' }
                      ]}
                      size="small"
                      disabled={showAllTechniques}
                      sx={{ 
                        opacity: showAllTechniques ? 0.5 : 1,
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Show All toggle - repositioned below slider */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={showAllTechniques}
                          onChange={(e) => setShowAllTechniques(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">Show All Techniques</Typography>
                          <Tooltip title="When enabled, displays all techniques regardless of confidence score">
                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </Tooltip>
                        </Stack>
                      }
                    />
                    {!showAllTechniques && (
                      <Typography variant="caption" color="text.secondary">
                        Filtering by confidence ≥ {confidenceThreshold.toFixed(1)}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>
              
              {/* Techniques List */}
              {filteredTechniques.length > 0 ? (
                <List dense>
                  {filteredTechniques.map((technique) => {
                    const techniqueId = getTechniqueId(technique);
                    return (
                      <ListItem key={techniqueId} sx={{ 
                        opacity: showAllTechniques && (technique.confidence ?? 0) < confidenceThreshold ? 0.6 : 1,
                        transition: 'opacity 0.2s ease-in-out'
                      }}>
                        <ListItemIcon>
                          <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Link
                                href={`https://attack.mitre.org/techniques/${techniqueId.replace('.', '/')}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                              >
                                {techniqueId}
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </Link>
                              <Typography variant="body2">{technique.name}</Typography>
                              <Chip
                                label={`${((technique.confidence ?? 0) * 100).toFixed(0)}%`}
                                size="small"
                                color={
                                  (technique.confidence ?? 0) >= 0.8 ? 'success' :
                                  (technique.confidence ?? 0) >= 0.5 ? 'warning' : 'default'
                                }
                                variant="outlined"
                              />
                            </Stack>
                          }
                          secondary={technique.tactics?.join(', ')}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {showAllTechniques ? 
                      'No MITRE techniques found' : 
                      `No techniques with confidence ≥ ${confidenceThreshold.toFixed(1)}`
                    }
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* CVE References */}
            {rule.cve_references && rule.cve_references.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>CVE References</Typography>
                <List dense>
                  {rule.cve_references.map((cve) => (
                    <ListItem key={cve.cve_id}>
                      <ListItemIcon>
                        <BugReportIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Link
                              href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              {cve.cve_id}
                              <OpenInNewIcon fontSize="small" />
                            </Link>
                            {(cve.cvss_score || cve.cvss_v3_score) && (
                              <Chip
                                label={`CVSS ${(cve.cvss_score || cve.cvss_v3_score)?.toFixed(1)}`}
                                size="small"
                                sx={{
                                  bgcolor: getCVSSColor(cve.cvss_score || cve.cvss_v3_score || 0),
                                  color: 'white',
                                }}
                              />
                            )}
                            <Chip label={cve.severity || 'unknown'} size="small" variant="outlined" />
                          </Stack>
                        }
                        secondary={cve.description?.substring(0, 200) + '...'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Malware Family & Intrusion Set */}
            {(rule.malware_family || rule.intrusion_set) && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Threat Intelligence</Typography>
                <Grid container spacing={2}>
                  {rule.malware_family && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Malware Family</Typography>
                      <Typography variant="body2">{rule.malware_family}</Typography>
                    </Grid>
                  )}
                  {rule.intrusion_set && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Intrusion Set</Typography>
                      <Typography variant="body2">{rule.intrusion_set}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Enrichment Score */}
            {rule.enrichment_score !== undefined && rule.enrichment_score !== null && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Enrichment Quality</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Score</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {rule.enrichment_score.toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${rule.enrichment_score}%`,
                          height: '100%',
                          bgcolor: rule.enrichment_score >= 80 ? 'success.main' : 
                                  rule.enrichment_score >= 50 ? 'warning.main' : 'error.main',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Stack>
        </TabPanel>

        {/* Raw Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Raw Rule Data</Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              borderRadius: 1,
              border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, Monaco, monospace',
              fontSize: '0.75rem',
              minHeight: 400,
              maxHeight: 600,
              overflowY: 'auto',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: theme.palette.mode === 'dark' ? '#555' : '#999',
                borderRadius: 1,
              },
            }}>
              <pre style={{ 
                margin: 0,
                color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#212121',
              }}>
                {JSON.stringify(rule.rule_metadata || rule.raw_rule || rule, null, 2)}
              </pre>
            </Box>
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default RuleDetail;