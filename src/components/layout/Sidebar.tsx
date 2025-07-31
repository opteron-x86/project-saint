// src/components/layout/Sidebar.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  Tooltip,
  IconButton,
  Toolbar, // Added to match AppLayout structure if needed for spacing
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // For toggle button
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useSidebar } from '../../contexts/SidebarContext'; // Assuming this context provides isOpen and toggle

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  width: number;
  variant?: 'mobile' | 'desktop';
  collapsed?: boolean; // This prop will determine if we show only icons
}

const Sidebar: React.FC<SidebarProps> = ({ width, variant, collapsed }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, toggle: toggleSidebar, open: openSidebar, close: closeSidebar } = useSidebar();

  // Determine if the sidebar should be in the truly collapsed (icon-only) state
  // This is true if 'collapsed' prop is true AND it's the desktop variant.
  const isIconOnly = collapsed && variant === 'desktop';

  const mainNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/insights', label: 'Insights', icon: <InsightsIcon /> },
    { path: '/attack-matrix', label: 'ATT&CK Matrix', icon: <HubIcon /> },
    { path: '/rules', label: 'Rules Explorer', icon: <SecurityIcon /> },
  ];

  const secondaryNavItems: NavItem[] = [
    // { path: '/saved', label: 'Saved Items', icon: <BookmarkIcon /> }, // Uncomment if page exists
    // { path: '/settings', label: 'Settings', icon: <SettingsIcon /> }, // Uncomment if page exists
    // { path: '/help', label: 'Help & Support', icon: <HelpIcon /> }, // Uncomment if page exists
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'mobile' && isOpen) { // Close mobile drawer on navigation
        closeSidebar();
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path); // Use startsWith for parent routes
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
            mb: 0.5, // Reduced margin for a denser look
            borderRadius: 1,
            ...(isActive(item.path) && {
              bgcolor: 'primary.main', // More prominent selection color
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
                    bgcolor: alpha(theme.palette.action.hover, 0.08),
                }
            })
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isIconOnly ? 0 : 2, // No margin right if icon only
              justifyContent: 'center',
              color: isActive(item.path) ? 'inherit' : 'text.secondary', // Ensure icon color matches selection
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!isIconOnly && ( // Only render ListItemText if not icon-only
            <ListItemText primary={item.label} sx={{ opacity: isIconOnly ? 0 : 1 }} />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Optional: Add Toolbar for consistent spacing if AppLayout's Toolbar doesn't cover it for Drawer content */}
      {/* <Toolbar /> */}
      <Box
        sx={{
          p: isIconOnly ? 1 : 2, // Less padding when icon-only
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isIconOnly ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!isIconOnly && ( // Hide title when icon-only
          <Typography variant="h6" color="primary" fontWeight="bold" noWrap>
            SAINT
          </Typography>
        )}
        {/* Toggle button for desktop persistent drawer */}
        {variant === 'desktop' && (
          <IconButton onClick={toggleSidebar} size="small">
            {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>
      
      <List sx={{ px: isIconOnly ? 1 : 1.5, pt: 1, flexGrow: 1 }}> {/* Adjust padding */}
        {mainNavItems.map(renderNavItem)}
      </List>

      {secondaryNavItems.length > 0 && <Divider sx={{ my: 1 }} />}

      <List sx={{ px: isIconOnly ? 1 : 1.5, pb: 1 }}>
        {secondaryNavItems.map(renderNavItem)}
      </List>
    </Box>
  );
};

// Helper function from MUI docs for alpha
function alpha(color: string, opacity: number): string {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(color) && !/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.test(color)) {
        // Not a hex or rgb(a) color, return as is or handle error
        return color;
    }

    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (rgbaMatch) {
        return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
    }
    return color; // Fallback
}


export default Sidebar;