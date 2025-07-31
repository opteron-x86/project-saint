// src/components/rules/RuleCard.tsx

import React from 'react';
import {
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider, SxProps, Theme,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { RuleSummary } from '@/api/types';
import { Card, StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
// SEVERITY_DISPLAY is no longer needed here

interface RuleCardProps {
  rule: RuleSummary;
  isBookmarked?: boolean;
  onClick?: (rule: RuleSummary) => void;
  onBookmark?: (ruleId: string) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  isBookmarked = false,
  onClick,
  onBookmark,
}) => {
  const theme = useTheme();

  const {
    id, title,
    // severity, // REMOVED
    rule_source, created_date,
    rule_platforms = [],
    linked_technique_ids = [],
    status,
    // validation_status, // REMOVED
  } = rule;

  // Since severity is not available on RuleSummary, we cannot display it here.
  // We can only show the general status (e.g., enabled/disabled).

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
          {/* Severity badge is removed here as it's not available */}
        </Box>
      </Box>

      <Divider />

      {/* Content Section */}
      <Box sx={{ p: 2, pt: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            mb: 1.5, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
            minHeight: '4.2em', 
          }}
        >
          {rule.description || 'No description provided.'}
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
      </Box>
    </Card>
  );
};

export default RuleCard;