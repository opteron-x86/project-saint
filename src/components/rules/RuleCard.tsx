// src/components/rules/RuleCard.tsx

import React from 'react';
import {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider, SxProps, Theme,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

<<<<<<< HEAD
<<<<<<< HEAD
import { RuleSummary, RuleSeverity } from '@/api/types'; // MODIFIED: Imported RuleSeverity
import { Card, StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
import { SEVERITY_DISPLAY } from '@/utils/constants'; // MODIFIED: Re-imported SEVERITY_DISPLAY

interface RuleCardProps {
  rule: RuleSummary;
  isBookmarked?: boolean;
  onClick?: (rule: RuleSummary) => void;
  onBookmark?: (ruleId: string) => void;
}

=======
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
=======
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider,
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
} from '@mui/material';
=======
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider, SxProps, Theme,
<<<<<<< HEAD
} from '@mui/material'; // Added SxProps, Theme
>>>>>>> 318d3ed (fixes for rule explorer)
=======
} from '@mui/material';
>>>>>>> bd2b152 (fix for rulecard width)
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { RuleSummary, RuleSeverity as RuleSeverityEnum } from '@/api/types';
=======
import { RuleSummary } from '@/api/types';
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
import { RuleSummary, RuleSeverity } from '@/api/types'; // MODIFIED: Imported RuleSeverity
>>>>>>> 37ba2d8 (Initial commit)
import { Card, StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
import { SEVERITY_DISPLAY } from '@/utils/constants'; // MODIFIED: Re-imported SEVERITY_DISPLAY

interface RuleCardProps {
  rule: RuleSummary;
  isBookmarked?: boolean;
  onClick?: (rule: RuleSummary) => void;
  onBookmark?: (ruleId: string) => void;
}

<<<<<<< HEAD
/**
 * Card component for displaying a rule summary
 */
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  isBookmarked = false,
  onClick,
  onBookmark,
<<<<<<< HEAD
<<<<<<< HEAD
}) => {
  const theme = useTheme();

  const {
    id, title,
    severity, // MODIFIED: Re-enabled severity
    rule_source, created_date,
    rule_platforms = [],
    linked_technique_ids = [],
    status,
  } = rule;

  const validation_status = (rule as any).raw_rule?.validation_status;

  const handleCardClick = () => {
    if (onClick) {
      onClick(rule);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(id);
    }
  };

  const renderChipsSection = (
    items: string[],
    label: string,
    iconElement?: React.ReactNode,
    chipVariant: 'filled' | 'outlined' = 'filled',
    chipColor: 'default' | 'primary' | 'secondary' = 'default',
    isLink: boolean = false
  ) => {
    if (!items || items.length === 0) return null;
    const displayed = items.slice(0, 2);
    const overflow = items.length - displayed.length;
    const iconWrapperSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' };

    return (
      <Box mt={1.5}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          {iconElement && <Box component="span" sx={iconWrapperSx}>{iconElement}</Box>}
          {label}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {displayed.map((item) => (
            <Tooltip title={item} key={`${label}-${item}`}>
              <Chip
                label={item}
                size="small"
                variant={chipVariant}
                color={chipColor !== 'default' ? chipColor : undefined}
                clickable={isLink}
                component={isLink ? "a" : "div"}
                href={isLink ? `https://attack.mitre.org/techniques/${item.replace('.', '/')}` : undefined}
                target={isLink ? "_blank" : undefined}
                rel={isLink ? "noopener noreferrer" : undefined}
                onClick={isLink ? (e: React.MouseEvent) => e.stopPropagation() : undefined}
                sx={{
                  height: 20, fontSize: '0.7rem',
                  fontFamily: isLink ? 'monospace' : undefined,
                  bgcolor: chipColor === 'default' ? (chipVariant === 'outlined' ? 'transparent' : 'action.hover') : undefined,
                  borderColor: chipColor === 'default' && chipVariant === 'outlined' ? 'divider' : undefined,
                  mb: 0.5
                }}
              />
            </Tooltip>
          ))}
          {overflow > 0 && (
            <Tooltip title={items.slice(2).join(', ')}>
              <Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700', mb: 0.5 }} />
            </Tooltip>
          )}
        </Stack>
      </Box>
    );
  };

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

  const ruleStatus = status?.toLowerCase() || 'unknown';
  let statusBadgeType: 'success' | 'error' | 'default' | 'warning' = 'default';
  if (ruleStatus === 'enabled') statusBadgeType = 'success';
  else if (ruleStatus === 'disabled') statusBadgeType = 'error';

  return (
    <Card
      sx={{ 
        cursor: onClick ? 'pointer' : 'default', 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        height: 400,
      }}
      onClick={handleCardClick}
      aria-label={`Rule: ${title}`}
    >
      {/* Header Section */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom title={title}
              sx={{ lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '2.6em' }}
            >
              {title || 'Untitled Rule'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
              <Chip label={rule_source} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500, bgcolor: 'action.hover' }} />
              <Typography variant="caption" color="text.secondary">{created_date ? formatDate(created_date) : '-'}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 0.5, pt:0.5 }}>
            {onBookmark && (
              <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
                <IconButton size="small" onClick={handleBookmarkClick} sx={{ color: isBookmarked ? theme.palette.warning.main : theme.palette.action.active }}>
                  {isBookmarked ? <BookmarkIcon fontSize="small"/> : <BookmarkBorderIcon fontSize="small"/>}
                </IconButton>
              </Tooltip>
            )}
             <StatusBadge label={status || 'Unknown'} status={statusBadgeType} size="small" showDot={false}/>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title={id}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.background.default, px: 1, py: 0.5, borderRadius: 1, maxWidth: 'calc(100% - 100px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {id}
            </Typography>
          </Tooltip>
          {/* MODIFIED: Re-enabled severity badge */}
          <StatusBadge label={SEVERITY_DISPLAY[severity as RuleSeverity] || 'Unknown'} status={severity?.toLowerCase()} size="small" />
        </Box>
      </Box>

      <Divider />

      {/* Content Section */}
      <Box sx={{ p: 2, pt: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
=======
  showDetails = false,
=======
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
}) => {
  const theme = useTheme();

  const {
    id, title,
    severity, // MODIFIED: Re-enabled severity
    rule_source, created_date,
    rule_platforms = [],
    linked_technique_ids = [],
    status,
  } = rule;

  const validation_status = (rule as any).raw_rule?.validation_status;

  const handleCardClick = () => {
    if (onClick) {
      onClick(rule);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(id);
    }
  };

  const renderChipsSection = (
    items: string[],
    label: string,
    iconElement?: React.ReactNode,
    chipVariant: 'filled' | 'outlined' = 'filled',
    chipColor: 'default' | 'primary' | 'secondary' = 'default',
    isLink: boolean = false
  ) => {
    if (!items || items.length === 0) return null;
    const displayed = items.slice(0, 2);
    const overflow = items.length - displayed.length;
    const iconWrapperSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' };

    return (
      <Box mt={1.5}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          {iconElement && <Box component="span" sx={iconWrapperSx}>{iconElement}</Box>}
          {label}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {displayed.map((item) => (
            <Tooltip title={item} key={`${label}-${item}`}>
              <Chip
                label={item}
                size="small"
                variant={chipVariant}
                color={chipColor !== 'default' ? chipColor : undefined}
                clickable={isLink}
                component={isLink ? "a" : "div"}
                href={isLink ? `https://attack.mitre.org/techniques/${item.replace('.', '/')}` : undefined}
                target={isLink ? "_blank" : undefined}
                rel={isLink ? "noopener noreferrer" : undefined}
                onClick={isLink ? (e: React.MouseEvent) => e.stopPropagation() : undefined}
                sx={{
                  height: 20, fontSize: '0.7rem',
                  fontFamily: isLink ? 'monospace' : undefined,
                  bgcolor: chipColor === 'default' ? (chipVariant === 'outlined' ? 'transparent' : 'action.hover') : undefined,
                  borderColor: chipColor === 'default' && chipVariant === 'outlined' ? 'divider' : undefined,
                  mb: 0.5
                }}
              />
            </Tooltip>
          ))}
          {overflow > 0 && (
            <Tooltip title={items.slice(2).join(', ')}>
              <Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700', mb: 0.5 }} />
            </Tooltip>
          )}
        </Stack>
      </Box>
    );
  };

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

  const ruleStatus = status?.toLowerCase() || 'unknown';
  let statusBadgeType: 'success' | 'error' | 'default' | 'warning' = 'default';
  if (ruleStatus === 'enabled') statusBadgeType = 'success';
  else if (ruleStatus === 'disabled') statusBadgeType = 'error';

  return (
    <Card
      sx={{ 
        cursor: onClick ? 'pointer' : 'default', 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        height: 400,
      }}
      onClick={handleCardClick}
      aria-label={`Rule: ${title}`}
    >
      {/* Header Section */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom title={title}
              sx={{ lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '2.6em' }}
            >
              {title || 'Untitled Rule'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
              <Chip label={rule_source} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500, bgcolor: 'action.hover' }} />
              <Typography variant="caption" color="text.secondary">{created_date ? formatDate(created_date) : '-'}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 0.5, pt:0.5 }}>
            {onBookmark && (
              <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
                <IconButton size="small" onClick={handleBookmarkClick} sx={{ color: isBookmarked ? theme.palette.warning.main : theme.palette.action.active }}>
                  {isBookmarked ? <BookmarkIcon fontSize="small"/> : <BookmarkBorderIcon fontSize="small"/>}
                </IconButton>
              </Tooltip>
            )}
             <StatusBadge label={status || 'Unknown'} status={statusBadgeType} size="small" showDot={false}/>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title={id}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.background.default, px: 1, py: 0.5, borderRadius: 1, maxWidth: 'calc(100% - 100px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {id}
            </Typography>
          </Tooltip>
          {/* MODIFIED: Re-enabled severity badge */}
          <StatusBadge label={SEVERITY_DISPLAY[severity as RuleSeverity] || 'Unknown'} status={severity?.toLowerCase()} size="small" />
        </Box>
      </Box>

      <Divider />
<<<<<<< HEAD
      
      {/* Rule Body */}
      <Box sx={{ p: 2, pt: 1, flex: 1 }}>
        {/* Description */}
>>>>>>> a380730 (Initial deployment)
=======

      {/* Content Section */}
      <Box sx={{ p: 2, pt: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
        <Typography
=======
        <Typography // Description
>>>>>>> 318d3ed (fixes for rule explorer)
=======
        {/* Description - Ensure it uses rule.description */}
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
        <Typography
>>>>>>> bd2b152 (fix for rulecard width)
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
<<<<<<< HEAD
<<<<<<< HEAD
            mb: 1.5, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
            minHeight: '4.2em', 
          }}
        >
<<<<<<< HEAD
<<<<<<< HEAD
          {rule.description || 'No description provided.'}
=======
>>>>>>> 23c77cf (code cleanup)
=======
          {rule.description || 'No description provided.'}
>>>>>>> 23a6656 (Feature/issue creator)
        </Typography>

        <Box> 
          {renderChipsSection(rule_platforms || [], "Rule Platforms", <LanguageIcon />, 'outlined', 'secondary')}
          {renderChipsSection(linked_technique_ids || [], "Techniques", <HubIcon />, 'filled', 'primary', true)}
          {validation_status && (
            <Box mt={1.5}>
                 <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    Validation
                </Typography>
                <Chip 
                    icon={validationIcon} 
                    label={validationChipLabel} 
                    size="small" 
                    color={validationChipColor} 
                    variant="outlined" 
                    sx={{height: 22, fontSize:'0.7rem'}} 
                />
            </Box>
          )}
        </Box>
=======
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
=======
            mb: 1.5, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
<<<<<<< HEAD
            minHeight: '4.2em' // Approx 3 lines height
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
            minHeight: '4.2em' // Approx 3 lines height based on 1.4em line-height for body2
>>>>>>> 984e985 (backend rework for rule_platforms)
=======
            minHeight: '4.2em' 
>>>>>>> 318d3ed (fixes for rule explorer)
=======
            minHeight: '4.2em', // Approx 3 lines height based on 1.4em line-height for body2
            // If description is very short, this section might not grow much.
            // The overall card minHeight will help, but internal flex distribution matters.
>>>>>>> bd2b152 (fix for rulecard width)
          }}
        >
          {description || 'No description available.'}
        </Typography>

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        {platforms.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom>
              Platforms
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {platforms.slice(0, 3).map((platform) => (
                <Chip key={platform} label={platform} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.lighter', color: 'primary.dark', mb: 0.5 }} />
              ))}
              {platforms.length > 3 && (
                <Chip label={`+${platforms.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.200', color: 'grey.700', mb: 0.5 }} />
              )}
            </Stack>
          </Box>
        )}
<<<<<<< HEAD
        
        {/* Tactics and Techniques - Only show in detailed view */}
        {showDetails && (
          <>
            {/* Tactics */}
            {tactics.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  display="block"
                  gutterBottom
                >
                  Tactics
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {tactics.slice(0, 3).map((tactic) => (
                    <Chip
                      key={`tactic-${tactic}`} // Updated unique key
                      label={tactic}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.secondary.lighter,
                        color: theme.palette.secondary.dark,
                        mb: 0.5,
                      }}
                    />
                  ))}
                  {tactics.length > 3 && (
                    <Chip
                      key="tactic-more"
                      label={`+${tactics.length - 3}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.grey[200],
                        color: theme.palette.grey[700],
                        mb: 0.5,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}
            
            {/* Techniques */}
            {(techniques.length > 0 || subtechniques.length > 0) && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  display="block"
                  gutterBottom
                >
                  Techniques
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {/* Render techniques with unique keys */}
                  {techniques.slice(0, 3).map((technique) => (
                    <Chip
                      key={`technique-${technique}`} // Updated unique key with prefix
                      label={technique}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.info.lighter,
                        color: theme.palette.info.dark,
                        mb: 0.5,
                      }}
                    />
                  ))}
                  
                  {/* Render subtechniques with different unique keys */}
                  {subtechniques.slice(0, Math.max(0, 3 - techniques.length)).map((subtechnique) => (
                    <Chip
                      key={`subtechnique-${subtechnique}`} // Updated unique key with different prefix
                      label={subtechnique}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.info.lighter,
                        color: theme.palette.info.dark,
                        mb: 0.5,
                      }}
                    />
                  ))}
                  
                  {/* Show more chip if needed */}
                  {(techniques.length + subtechniques.length) > 3 && (
                    <Chip
                      key="technique-more"
                      label={`+${(techniques.length + subtechniques.length) - 3}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.grey[200],
                        color: theme.palette.grey[700],
                        mb: 0.5,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </>
        )}
>>>>>>> a380730 (Initial deployment)
=======
        {/* Removed Tactics and Techniques display as they are not in RuleSummary */}
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
=======
        {/* Bottom details: Rule Platforms, Techniques, Validation */}
>>>>>>> 318d3ed (fixes for rule explorer)
        <Box>
          {renderChipsSection(
            rule_platforms || [], // Ensure array is passed
            "Rule Platforms",
            <LanguageIcon />,
            'outlined',
            'secondary'
          )}

          {renderChipsSection(
            linked_technique_ids || [], // Ensure array is passed
            "Techniques",
            <HubIcon />,
            'filled',
            'primary',
            true // Make these chips links
          )}
          
          {validation_status && ( // Check if validation_status has a value before rendering
=======
        {/* Container for bottom chip sections - this Box will be pushed to the bottom by flexGrow on parent */}
        <Box> 
          {renderChipsSection(rule_platforms || [], "Rule Platforms", <LanguageIcon />, 'outlined', 'secondary')}
          {renderChipsSection(linked_technique_ids || [], "Techniques", <HubIcon />, 'filled', 'primary', true)}
          {validation_status && (
>>>>>>> bd2b152 (fix for rulecard width)
            <Box mt={1.5}>
                 <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    Validation
                </Typography>
                <Chip 
                    icon={validationIcon} 
                    label={validationChipLabel} 
                    size="small" 
                    color={validationChipColor} 
                    variant="outlined" 
                    sx={{height: 22, fontSize:'0.7rem'}} 
                />
            </Box>
          )}
        </Box>
>>>>>>> 984e985 (backend rework for rule_platforms)
      </Box>
    </Card>
  );
};

export default RuleCard;