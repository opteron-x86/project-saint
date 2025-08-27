// src/components/layout/Sidebar.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import SecurityIcon from '@mui/icons-material/Security';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useSidebar } from '../../contexts/SidebarContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  width: number;
  variant?: 'mobile' | 'desktop';
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ width, variant, collapsed }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { close: closeSidebar } = useSidebar();

  const isIconOnly = collapsed && variant === 'desktop';

  const mainNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/rules', label: 'Rules Explorer', icon: <SecurityIcon /> },
    { path: '/attack-matrix', label: 'ATT&CK Matrix', icon: <HubIcon /> },
    { path: '/insights', label: 'Insights', icon: <InsightsIcon /> },
  ];

  const secondaryNavItems: NavItem[] = [
    // { path: '/saved', label: 'Saved Items', icon: <BookmarkIcon /> },
    // { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    // { path: '/help', label: 'Help & Support', icon: <HelpIcon /> },
    { path: '#', label: '0.1.1-alpha.2.250827', icon: <SettingsIcon /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'mobile') {
      closeSidebar();
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => (
    <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
      <Tooltip title={isIconOnly ? item.label : ''} placement="right" arrow>
        <ListItemButton
          selected={isActive(item.path)}
          onClick={() => handleNavigation(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: isIconOnly ? 'center' : 'initial',
            px: 2.5,
            mb: 0.5,
            borderRadius: 1,
            ...(isActive(item.path) && {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            }),
            ...(!isActive(item.path) && {
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              }
            })
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isIconOnly ? 0 : 2,
              justifyContent: 'center',
              color: isActive(item.path) ? 'inherit' : 'text.secondary',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!isIconOnly && (
            <ListItemText primary={item.label} />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      pt: 2,
    }}>
      <List sx={{ px: isIconOnly ? 1 : 1.5, flexGrow: 1 }}>
        {mainNavItems.map(renderNavItem)}
      </List>

      {secondaryNavItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List sx={{ px: isIconOnly ? 1 : 1.5, pb: 1 }}>
            {secondaryNavItems.map(renderNavItem)}
          </List>
        </>
      )}
    </Box>
  );
};

export default Sidebar;