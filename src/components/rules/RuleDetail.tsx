// src/components/rules/RuleDetail.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Divider, Chip, Stack, IconButton, Tooltip, Tab, Tabs, Link, useTheme, Paper,
  useMediaQuery, Toolbar, Button,
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
import HubIcon from '@mui/icons-material/Hub'; // For Techniques
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // For Tactics
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportIcon from '@mui/icons-material/BugReport'; // For Create Issue
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';


import { RuleDetail as RuleDetailType, RuleSeverity as RuleSeverityEnum } from '../../api/types';
import { StatusBadge } from '../common';
import { formatDateTime, formatQueryLanguage } from '../../utils/format';
import { SEVERITY_DISPLAY } from '../../utils/constants';
import RuleTagsDisplay from './RuleTagsDisplay';
import { useMitreMatrixQuery } from '@/api/queries';
import { CreateIssueModal } from './CreateIssueModal';
import { useRuleStore } from '@/store'; // Import the rule store

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
  value?: string | number | null;
  children?: React.ReactNode;
  isStatus?: boolean;
  statusType?: string;
  fullWidthChildren?: boolean;
}
const DetailGridItem: React.FC<DetailGridItemProps> = ({ label, value, children, isStatus, statusType, fullWidthChildren }) => {
  if (value === undefined && value === null && !children) return null;
  const displayValue = value === null && !children ? '-' : value;

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, gridColumn: '1 / span 1', pt:0.5, pr: 1, textAlign: 'right' }}>{label}:</Typography>
      <Box sx={{ gridColumn: fullWidthChildren ? '2 / -1' : '2 / span 1', pt:0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {isStatus ? (
          <StatusBadge label={String(displayValue ?? 'Unknown')} status={statusType || String(displayValue ?? 'unknown').toLowerCase()} size="small" />
        ) : children ? (
          children
        ) : (
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{String(displayValue ?? '-')}</Typography>
        )}
      </Box>
    </>
  );
};


interface RuleDetailProps {
  rule: RuleDetailType | null;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
  onShare?: (ruleId: string) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
  isBookmarked = false,
  onClose,
  onBookmark,
  onShare,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);

  const { data: mitreMatrixData } = useMitreMatrixQuery();
  const [tacticDetailsMap, setTacticDetailsMap] = useState<Record<string, { name: string; url?: string | null }>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- FIX APPLIED HERE ---
  // Get the action to add a rule to the recently viewed list.
  const addRecentlyViewedRule = useRuleStore((state) => state.addRecentlyViewedRule);

  // When the component displays a rule, add it to the recently viewed list.
  useEffect(() => {
    if (rule) {
      addRecentlyViewedRule(rule);
    }
  }, [rule, addRecentlyViewedRule]);
  // --- END FIX ---

  const ruleSpecifics = useMemo(() => {
    if (!rule) return null;

    const elastic = rule.elastic_details;
    const sentinel = rule.sentinel_details;
    const trinity = rule.trinitycyber_details;

    return {
      severity: rule.severity || 'unknown', // Use the top-level severity
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
    };
  }, [rule]);

  useEffect(() => {
    if (mitreMatrixData && rule?.raw_rule?.tactics) {
      const newMap: Record<string, { name: string; url?: string | null }> = {};
      const tacticIds = (Array.isArray(rule.raw_rule.tactics) ? rule.raw_rule.tactics : []) as string[];
      tacticIds.forEach(tacticId => {
        const foundTactic = mitreMatrixData.find(t => t.id === tacticId || t.shortname === tacticId || t.stix_id === tacticId);
        if (foundTactic) {
          newMap[tacticId] = { name: foundTactic.name, url: foundTactic.url };
        } else {
          newMap[tacticId] = { name: tacticId, url: `https://attack.mitre.org/tactics/${tacticId}` };
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

  if (!rule || !ruleSpecifics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">No rule data to display.</Typography>
      </Box>
    );
  }

  const {
    id, title, description, rule_source, created_date, modified_date, author,
    linked_techniques = [],
    rule_platforms = [],
    status,
    raw_rule,
    source_file_path,
    source_rule_id,
  } = rule;

  const validation_status = (raw_rule as any)?.validation_status;

  const {
    severity, query, query_language, version, risk_score, license, interval, tags, false_positives,
    human_hash, cve, implementation
  } = ruleSpecifics;

  const severityDisplay = SEVERITY_DISPLAY[severity as RuleSeverityEnum] || severity || 'Unknown';
  const rawTacticsFromRule = (Array.isArray(raw_rule?.tactics) ? raw_rule.tactics : []) as string[];

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
      <Toolbar sx={{boxShadow: 'none', minHeight: { xs: '56px', sm: '64px' }, p: '0 !important', m:0, visibility: 'hidden', pointerEvents: 'none' }} />
      
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{pr: 1, overflow: 'hidden'}}>
          <Tooltip title={title}>
            <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>{title}</Typography>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
            <Chip label={rule_source} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }} />
            <StatusBadge label={severityDisplay} status={severity.toLowerCase()} size="small" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID:
            </Typography>
            <Tooltip title={id}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {id}
                </Typography>
            </Tooltip>
            <Tooltip title="Copy ID">
              <IconButton size="small" onClick={() => handleCopyToClipboard(id, 'Rule ID copied to clipboard!')} sx={{ p: 0.25 }}>
                <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', pt:0.5, pl:1 }}>
          {onBookmark && (
            <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
              <IconButton size="small" onClick={() => onBookmark(id)} sx={{ color: isBookmarked ? theme.palette.warning.main : theme.palette.action.active }}>
                {isBookmarked ? <BookmarkIcon fontSize="inherit"/> : <BookmarkBorderIcon fontSize="inherit"/>}
              </IconButton>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip title="Share rule">
              <IconButton size="small" onClick={() => onShare(id)}><ShareIcon fontSize="inherit"/></IconButton>
            </Tooltip>
          )}
          {onClose && (
            <Tooltip title="Close"><IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}><CloseIcon fontSize="inherit"/></IconButton></Tooltip>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: isMobile ? 0: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="rule detail tabs" variant={isMobile ? "fullWidth" : "scrollable"} scrollButtons="auto" allowScrollButtonsMobile>
          <Tab icon={<InfoIcon fontSize="small" />} iconPosition="start" label="Overview" id="rule-tab-0" sx={{minHeight: 48, py:1, fontSize: '0.8rem'}}/>
          <Tab icon={<CodeIcon fontSize="small" />} iconPosition="start" label="Query" id="rule-tab-1" sx={{minHeight: 48, py:1, fontSize: '0.8rem'}}/>
          <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="ATT&CK" id="rule-tab-2" sx={{minHeight: 48, py:1, fontSize: '0.8rem'}}/>
          <Tab icon={<DataObjectIcon fontSize="small" />} iconPosition="start" label="Raw JSON" id="rule-tab-3" sx={{minHeight: 48, py:1, fontSize: '0.8rem'}}/>
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', px: isMobile ? 1.5 : 2.5 }}>
        <TabPanel value={tabValue} index={0}> {/* Overview */}
          <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb:1}}>Description</Typography>
          <Typography variant="body2" paragraph sx={{whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 2.5}}>
            {description || 'No description provided.'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb:1.5}}>Rule Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 1, rowGap: 1, '& .MuiTypography-body2': { color: 'text.secondary' }}}>
            <DetailGridItem label="Rule Source" value={rule_source} />
            <DetailGridItem label="Source ID" value={source_rule_id} />
            <DetailGridItem label="Severity" value={severityDisplay} isStatus statusType={severity?.toLowerCase()} />
            <DetailGridItem label="Status" value={status} isStatus statusType={status?.toLowerCase()} />
             <DetailGridItem label="Validated" fullWidthChildren>
                <Chip 
                    icon={validationIcon} 
                    label={validationChipLabel} 
                    size="small" 
                    color={validationChipColor} 
                    variant="outlined" 
                    sx={{height: 22, fontSize:'0.7rem'}} 
                />
            </DetailGridItem>
            <DetailGridItem label="Author" value={author} />
            <DetailGridItem label="Created" value={created_date ? formatDateTime(created_date) : '-'} />
            <DetailGridItem label="Modified" value={modified_date ? formatDateTime(modified_date) : '-'} />
            <DetailGridItem label="Version" value={version} />
            <DetailGridItem label="Risk Score" value={risk_score?.toString()} />
            <DetailGridItem label="License" value={license} />
            <DetailGridItem label="Interval" value={interval} />
            <DetailGridItem label="Source File" value={source_file_path} />

            {rule.rule_source === 'trinitycyber' && (
              <>
                <DetailGridItem label="Human Hash" value={human_hash} />
                <DetailGridItem label="CVEs" fullWidthChildren>
                  {cve && cve.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {cve.map((cveId) => (
                        <Chip
                          key={cveId}
                          label={cveId}
                          size="small"
                          clickable
                          component="a"
                          href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            bgcolor: theme.palette.warning.light,
                            color: theme.palette.warning.dark,
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </DetailGridItem>
              </>
            )}

            <DetailGridItem label="Platforms" fullWidthChildren={true}>
              {rule_platforms && rule_platforms.length > 0 ? (
                rule_platforms.map((platform) => (<Chip key={`rule-plat-detail-${platform}`} label={platform} size="small" variant="outlined" color="secondary" />))
              ) : (
                <Typography variant="body2">-</Typography>
              )}
            </DetailGridItem>
          </Box>

          {tags && tags.length > 0 && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <RuleTagsDisplay tags={tags} label="Tags" />
            </>
          )}

          {(rawTacticsFromRule.length > 0 || linked_techniques.length > 0) && (
            <>
              <Divider sx={{my: 2.5 }} />
              <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb:1, display: 'flex', alignItems: 'center'}}>
                <SecurityIcon fontSize="small" sx={{mr:1, color: 'text.secondary'}} />
                MITRE ATT&CK Mapping
              </Typography>
              {rawTacticsFromRule.length > 0 && (
                <Box mb={1.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BubbleChartIcon sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                    Tactics
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {rawTacticsFromRule.map((tacticId) => {
                       const tacticInfo = tacticDetailsMap[tacticId];
                       const tacticName = tacticInfo?.name || tacticId;
                       const tacticUrl = tacticInfo?.url || `https://attack.mitre.org/tactics/${tacticId.toUpperCase()}`;
                       return (
                        <Tooltip title={tacticName} key={tacticId}>
                           <Chip
                            label={tacticName}
                            size="small"
                            variant="filled"
                            clickable
                            component="a"
                            href={tacticUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            sx={{fontFamily: tacticName === tacticId ? 'monospace' : undefined, bgcolor: theme.palette.info.light, color: theme.palette.info.dark, '&:hover': {bgcolor: theme.palette.info.main}}}
                          />
                        </Tooltip>
                       );
                    })}
                  </Stack>
                </Box>
              )}
              {linked_techniques.length > 0 && (
                 <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <HubIcon sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                        Techniques
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {linked_techniques.map((tech) => (
                            <Tooltip title={`${tech.name} (${tech.id})`} key={tech.id}>
                                <Chip
                                    label={tech.id}
                                    size="small"
                                    variant="filled"
                                    clickable
                                    component="a"
                                    href={tech.url || `https://attack.mitre.org/techniques/${tech.id.replace(/\./g, '/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{fontFamily: 'monospace', bgcolor: theme.palette.primary.light, color: theme.palette.primary.dark, '&:hover': {bgcolor: theme.palette.primary.main}}}
                                />
                            </Tooltip>
                        ))}
                    </Stack>
                </Box>
              )}
            </>
          )}
          
          {false_positives && false_positives.length > 0 && (
            <> <Divider sx={{ my: 2.5 }} /> <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb:1}}>False Positives</Typography> <Stack spacing={0.5}> {false_positives.map((fp, i) => (<Typography key={i} variant="body2" sx={{color: 'text.secondary'}}>• {fp}</Typography>))} </Stack> </>
          )}

          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              startIcon={<BugReportIcon />}
              onClick={() => setIsModalOpen(true)}
              fullWidth
            >
              Create Issue or Suggest Tuning
            </Button>
          </Box>
          
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {rule.rule_source === 'trinitycyber' ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  Implementation Details
                </Typography>
                <Tooltip title="Copy Implementation JSON">
                  <IconButton size="small" onClick={() => handleCopyToClipboard(JSON.stringify(implementation, null, 2), 'Implementation JSON copied!')}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : alpha(theme.palette.grey[900], 0.03),
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[800],
                  fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
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
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  Detection Logic ({query_language ? formatQueryLanguage(query_language) : 'N/A'})
                </Typography>
                <Box>
                  {query_language && <Chip label={formatQueryLanguage(query_language)} size="small" color="primary" variant="outlined" sx={{mr:1}} />}
                  <Tooltip title="Copy query">
                      <IconButton size="small" onClick={() => handleCopyToClipboard(query, 'Query copied to clipboard!')}>
                          <ContentCopyIcon fontSize="small" />
                      </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : alpha(theme.palette.grey[900], 0.03),
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[800],
                  fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace', 
                  fontSize: '0.875rem', 
                  lineHeight: 1.6,
                  borderRadius: 1, 
                  overflowX: 'auto', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-all', 
                  maxHeight: '60vh', 
                  mb:2 
                }}
              >
                {query}
              </Paper>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb:1.5}}>Linked MITRE ATT&CK Entities</Typography>
          {linked_techniques && linked_techniques.length > 0 ? (
            <Stack spacing={1.5}>
              {linked_techniques.map((tech) => (
                <Paper key={tech.id} variant="outlined" sx={{p:1.5, borderRadius:1}}>
                  <Link 
                    href={tech.url || `https://attack.mitre.org/techniques/${tech.id.replace(/\./g, '/')}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover" 
                    sx={{fontWeight: 500, display:'block', mb:0.5}}
                  >
                    {tech.name} ({tech.id})
                  </Link>
                  <Chip label={tech.is_subtechnique ? 'Sub-technique' : 'Technique'} size="small" variant="outlined" color={tech.is_subtechnique ? "secondary" : "primary"}/>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{mt:1}}>No MITRE ATT&CK techniques directly linked to this rule.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>Raw Rule JSON</Typography>
                <Tooltip title="Copy JSON">
                    <IconButton size="small" onClick={() => handleCopyToClipboard(JSON.stringify(raw_rule, null, 2), 'Raw JSON copied!')}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : alpha(theme.palette.grey[900], 0.03),
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[800],
                    fontFamily: '"Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
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
      </Box>
      <CreateIssueModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleId={rule.id}
        ruleName={rule.title}
      />
    </Box>
  );
};

export default RuleDetail;
