// src/components/layout/Header.tsx
import React from 'react';
import {
  Box, Typography, IconButton, Tooltip, Badge, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from 'react-oidc-context';
import { useRuleStore } from '@/store'; 
import { useNavigate } from 'react-router-dom';

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
  
  const { recentlyViewedRules, selectRule } = useRuleStore();

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

  const handleHistoryItemClick = (rule: any) => {
    handleHistoryMenuClose();
    selectRule(rule);
    navigate('/rules', { state: { openRuleId: rule.id } });
  };

  const handleSignOut = () => {
    handleProfileMenuClose();
    auth.signoutRedirect().catch(err => {
        console.error("Error during signoutRedirect:", err);
    });
  };

  // Split the title into brand and page parts
  const [brandPart, pagePart] = pageTitle.split(' | ');

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
          variant="h6"
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
            fontSize: 20,
            opacity: 0.4,
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

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Tooltip title="Recently Viewed">
          <IconButton color="inherit" size="large" onClick={handleHistoryMenuOpen}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="history-menu"
          anchorEl={historyAnchorEl}
          open={historyOpen}
          onClose={handleHistoryMenuClose}
          MenuListProps={{ 'aria-labelledby': 'history-button' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { maxHeight: 400, width: 350 } }}
        >
          <MenuItem disabled sx={{pointerEvents: 'none', opacity: 0.8}}>
            <Typography variant="body2" fontWeight="medium">Recently Viewed Rules</Typography>
          </MenuItem>
          <Divider />
          {recentlyViewedRules.length > 0 ? (
            recentlyViewedRules.map(rule => (
              <MenuItem key={rule.id} onClick={() => handleHistoryItemClick(rule)}>
                <ListItemText 
                  primary={<Typography variant="body2" noWrap>{rule.name}</Typography>}
                 />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText secondary="No recently viewed rules." />
            </MenuItem>
          )}
        </Menu>

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

        <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton onClick={toggleTheme} color="inherit" size="large">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {auth.isAuthenticated && auth.user?.profile ? (
          <>
            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleProfileMenuClose}
              MenuListProps={{ 'aria-labelledby': 'basic-button' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{pointerEvents: 'none', opacity: 0.8}}>
                <Typography variant="body2" fontWeight="medium">
                  {auth.user.profile.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                 <Typography color="error">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => auth.signinRedirect()}>
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Header;