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
import HistoryIcon from '@mui/icons-material/History'; // For recently viewed
import { useAuth } from 'react-oidc-context';
import { useRuleStore } from '@/store'; // Import the rule store
import { useNavigate } from 'react-router-dom'; // To navigate on click

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

  // State for user profile menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // --- FIX APPLIED HERE ---
  // State for recently viewed menu
  const [historyAnchorEl, setHistoryAnchorEl] = React.useState<null | HTMLElement>(null);
  const historyOpen = Boolean(historyAnchorEl);
  
  // Get recently viewed rules from the store
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
    // Use the store to select the rule, which can be picked up by the RulesExplorer page
    selectRule(rule);
    // Navigate to the explorer and open the detail drawer
    navigate('/rules', { state: { openRuleId: rule.id } });
  };
  // --- END FIX ---

  const handleSignOut = () => {
    handleProfileMenuClose();
    auth.signoutRedirect().catch(err => {
        console.error("Error during signoutRedirect:", err);
    });
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
      <Typography
        variant="h5"
        color="text.primary"
        noWrap
        component="div"
        sx={{
          fontWeight: 600,
          flexGrow: 1,
        }}
      >
        {pageTitle}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {/* --- FIX APPLIED HERE --- */}
        {/* Added History/Recently Viewed button and menu */}
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
                  primary={<Typography variant="body2" noWrap>{rule.title}</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary">{rule.id}</Typography>}
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText secondary="No recently viewed rules." />
            </MenuItem>
          )}
        </Menu>
        {/* --- END FIX --- */}

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
