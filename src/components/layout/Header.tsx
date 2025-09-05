// src/components/layout/Header.tsx
import React from 'react';
import {
  Box, Typography, IconButton, Tooltip, Badge, Menu, MenuItem, 
  ListItemText, Divider, Chip, alpha
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useAuth } from 'react-oidc-context';
import { useRuleStore } from '@/store'; 
import { useNavigate } from 'react-router-dom';
import { RuleDetail } from '@/api/types';

interface HeaderProps {
  pageTitle: string;
  toggleTheme: () => void;
  isDarkMode: boolean;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  toggleTheme,
  isDarkMode,
}) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [historyAnchorEl, setHistoryAnchorEl] = React.useState<null | HTMLElement>(null);
  const historyOpen = Boolean(historyAnchorEl);
  
  const { recentlyViewedRules, selectRule, clearRecentlyViewedRules } = useRuleStore();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleHistoryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHistoryAnchorEl(event.currentTarget);
  };

  const handleHistoryMenuClose = () => {
    setHistoryAnchorEl(null);
  };

  const handleHistoryItemClick = (rule: RuleDetail) => {
    handleHistoryMenuClose();
    selectRule(rule);
    // Navigate with state to open the rule detail
    navigate('/rules', { state: { openRuleId: rule.id } });
  };

  const handleClearHistory = () => {
    clearRecentlyViewedRules();
    handleHistoryMenuClose();
  };

  const handleSignOut = () => {
    handleProfileMenuClose();
    auth.signoutRedirect().catch(err => {
      console.error("Error during signoutRedirect:", err);
    });
  };

  // Split the title into brand and page parts
  const [brandPart, pagePart] = pageTitle.split(' | ');

  // Format rule source for display
  const formatRuleSource = (source: string) => {
    const sourceColors: Record<string, string> = {
      elastic: '#00bcd4',
      splunk: '#ff5722',
      crowdstrike: '#e91e63',
      sigma: '#9c27b0',
      f5_waf: '#4caf50',
      default: '#757575'
    };
    
    return sourceColors[source.toLowerCase()] || sourceColors.default;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            fontFamily: '"Inter", "Roboto", sans-serif',
          }}
        >
          {brandPart}
        </Typography>
        
        <ChevronRightIcon 
          sx={{ 
            color: 'text.disabled', 
            fontSize: 40,
            opacity: 0.6,
          }} 
        />
        
        <Typography
          variant="h6"
          color="text.primary"
          noWrap
          component="div"
          sx={{
            fontWeight: 500,
            fontSize: '1.1rem',
          }}
        >
          {pagePart}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 1 }}>
        {/* Recently Viewed Button */}
        <Tooltip title="Recently Viewed Rules">
          <IconButton 
            color="inherit" 
            size="large" 
            onClick={handleHistoryMenuOpen}
            sx={{
              position: 'relative',
              '&:hover': {
                backgroundColor: alpha(isDarkMode ? '#fff' : '#000', 0.08),
              }
            }}
          >
            <Badge 
              badgeContent={recentlyViewedRules.length} 
              color="primary"
              max={9}
            >
              <HistoryIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* Recently Viewed Menu */}
        <Menu
          id="history-menu"
          anchorEl={historyAnchorEl}
          open={historyOpen}
          onClose={handleHistoryMenuClose}
          MenuListProps={{ 'aria-labelledby': 'history-button' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ 
            sx: { 
              maxHeight: 400, 
              width: 400,
              mt: 1
            } 
          }}
        >
          <MenuItem 
            disabled 
            sx={{ 
              pointerEvents: 'none', 
              opacity: 1,
              pb: 1
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Recently Viewed Rules
            </Typography>
          </MenuItem>
          
          <Divider />
          
          {recentlyViewedRules.length > 0 ? (
            <>
              {recentlyViewedRules.slice(0, 10).map(rule => (
                <MenuItem 
                  key={rule.id} 
                  onClick={() => handleHistoryItemClick(rule)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: alpha(isDarkMode ? '#fff' : '#000', 0.04),
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="500" noWrap>
                        {rule.title || rule.name}
                      </Typography>
                      <Chip
                        label={rule.rule_source}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.7rem',
                          backgroundColor: formatRuleSource(rule.rule_source),
                          color: '#fff',
                        }}
                      />
                    </Box>
                    {rule.description && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {rule.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
              
              <Divider />
              
              <MenuItem onClick={handleClearHistory}>
                <ClearAllIcon fontSize="small" sx={{ mr: 1.5 }} />
                <ListItemText primary="Clear History" />
              </MenuItem>
            </>
          ) : (
            <MenuItem disabled>
              <ListItemText 
                secondary="No recently viewed rules." 
                sx={{ textAlign: 'center' }}
              />
            </MenuItem>
          )}
        </Menu>

        {/* Other header buttons */}
        <Tooltip title="Toggle theme">
          <IconButton onClick={toggleTheme} color="inherit" size="large">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton color="inherit" size="large">
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Help">
          <IconButton color="inherit" size="large">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Tooltip title="Profile">
          <IconButton onClick={handleProfileMenuOpen} color="inherit" size="large">
            <AccountCircleIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled sx={{ pointerEvents: 'none' }}>
            <Typography variant="body2">{auth.user?.profile?.email || 'User'}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;