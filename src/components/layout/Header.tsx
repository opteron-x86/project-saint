// src/components/layout/Header.tsx
<<<<<<< HEAD
<<<<<<< HEAD
import React from 'react';
import {
  Box, Typography, IconButton, Tooltip, Badge, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
=======

=======
>>>>>>> 6acc8f7 (Feature/authenticator)
import React from 'react';
import {
  Box, Typography, IconButton, Tooltip, Badge, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import SearchIcon from '@mui/icons-material/Search';
>>>>>>> a380730 (Initial deployment)
=======
// import SearchIcon from '@mui/icons-material/Search'; // No longer needed
>>>>>>> 81c958a (search feature)
=======
>>>>>>> 7f559c7 (add congnito auth)
=======
// import SearchIcon from '@mui/icons-material/Search'; // No longer needed
>>>>>>> e714fb1 (rollback authentication)
=======
>>>>>>> 277635e (header update)
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
<<<<<<< HEAD
<<<<<<< HEAD
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import HistoryIcon from '@mui/icons-material/History'; // For recently viewed
import { useAuth } from 'react-oidc-context';
import { useRuleStore } from '@/store'; // Import the rule store
import { useNavigate } from 'react-router-dom'; // To navigate on click
=======
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // For logout
import LoginIcon from '@mui/icons-material/Login'; // For login
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // For sign-up

import { useAuth } from 'react-oidc-context';
import { getCognitoSignUpUrl, getCognitoForgotPasswordUrl } from '@/authConfig'; // Import helper
>>>>>>> 7f559c7 (add congnito auth)
=======
>>>>>>> e714fb1 (rollback authentication)

interface HeaderProps {
<<<<<<< HEAD
  pageTitle: string;
=======

interface HeaderProps {
>>>>>>> a380730 (Initial deployment)
=======
  pageTitle: string; // Added prop for the page title
>>>>>>> 277635e (header update)
=======
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Re-added for profile icon
=======
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History'; // For recently viewed
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
import { useAuth } from 'react-oidc-context';
import { useRuleStore } from '@/store'; // Import the rule store
import { useNavigate } from 'react-router-dom'; // To navigate on click

interface HeaderProps {
  pageTitle: string;
>>>>>>> 6acc8f7 (Feature/authenticator)
  toggleTheme: () => void;
  isDarkMode: boolean;
  isMobile?: boolean;
}

<<<<<<< HEAD
<<<<<<< HEAD
const Header: React.FC<HeaderProps> = ({
  pageTitle,
  toggleTheme,
  isDarkMode,
}) => {
  const auth = useAuth();
  const navigate = useNavigate();

  // State for user profile menu
<<<<<<< HEAD
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
=======
const Header: React.FC<HeaderProps> = ({ 
  pageTitle, // Destructure the new prop
  toggleTheme, 
=======
const Header: React.FC<HeaderProps> = ({
  pageTitle,
  toggleTheme,
>>>>>>> 6acc8f7 (Feature/authenticator)
  isDarkMode,
}) => {
  const auth = useAuth();
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
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
<<<<<<< HEAD
<<<<<<< HEAD
            <Badge badgeContent={4} color="error">
>>>>>>> a380730 (Initial deployment)
=======
            <Badge badgeContent={0} color="error"> {/* Changed to 0 for placeholder */}
>>>>>>> 6acc8f7 (Feature/authenticator)
=======
            <Badge badgeContent={0} color="error">
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
<<<<<<< HEAD
<<<<<<< HEAD

=======
        
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        {/* Help */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 7f559c7 (add congnito auth)
=======
        {/* Help */}
>>>>>>> e714fb1 (rollback authentication)
=======
>>>>>>> 277635e (header update)
=======

>>>>>>> 6acc8f7 (Feature/authenticator)
        <Tooltip title="Help">
          <IconButton color="inherit" size="large">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
<<<<<<< HEAD
<<<<<<< HEAD

=======
        
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        {/* Theme Toggle */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 7f559c7 (add congnito auth)
=======
        {/* Theme Toggle */}
>>>>>>> e714fb1 (rollback authentication)
=======
>>>>>>> 277635e (header update)
=======

>>>>>>> 6acc8f7 (Feature/authenticator)
        <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton onClick={toggleTheme} color="inherit" size="large">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6acc8f7 (Feature/authenticator)

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
<<<<<<< HEAD
<<<<<<< HEAD
              MenuListProps={{ 'aria-labelledby': 'basic-button' }}
=======
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
>>>>>>> 6acc8f7 (Feature/authenticator)
=======
              MenuListProps={{ 'aria-labelledby': 'basic-button' }}
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{pointerEvents: 'none', opacity: 0.8}}>
                <Typography variant="body2" fontWeight="medium">
                  {auth.user.profile.email}
                </Typography>
              </MenuItem>
<<<<<<< HEAD
<<<<<<< HEAD
=======
              {/* Add other menu items like "Profile", "Settings" if needed */}
>>>>>>> 6acc8f7 (Feature/authenticator)
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
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
<<<<<<< HEAD
=======
        
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e714fb1 (rollback authentication)
        {/* User Profile */}
=======
>>>>>>> 277635e (header update)
        <Tooltip title="Profile">
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true" // Consider removing if no menu pops up
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Tooltip>
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======
        {/* Authentication Section */}
        {renderAuthSection()}
>>>>>>> 7f559c7 (add congnito auth)
=======
>>>>>>> e714fb1 (rollback authentication)
=======
>>>>>>> 6acc8f7 (Feature/authenticator)
      </Box>
    </Box>
  );
};

<<<<<<< HEAD
<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> a380730 (Initial deployment)
=======
export default Header;
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
