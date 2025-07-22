// src/components/layout/AppLayout.tsx

<<<<<<< HEAD
<<<<<<< HEAD
import React, { ReactNode, useState, useEffect } from 'react'; // Added useEffect
import { useLocation } from 'react-router-dom'; // Added useLocation
=======
import React, { ReactNode, useState } from 'react';
>>>>>>> a380730 (Initial deployment)
=======
import React, { ReactNode, useState, useEffect } from 'react'; // Added useEffect
import { useLocation } from 'react-router-dom'; // Added useLocation
>>>>>>> 277635e (header update)
import { 
  Box, 
  Drawer, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  Toolbar,
  AppBar as MuiAppBar,
  styled,
  Theme,
  CSSObject
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// ChevronLeftIcon was removed as it's unused here
=======
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 23c77cf (code cleanup)
=======
// ChevronLeftIcon was removed as it's unused here
>>>>>>> 277635e (header update)
import Header from './Header';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';

<<<<<<< HEAD
<<<<<<< HEAD
const DRAWER_WIDTH = 260;

=======
// Define the drawer width
const DRAWER_WIDTH = 260;

// Create custom styled components for the AppBar and Main content
>>>>>>> a380730 (Initial deployment)
=======
const DRAWER_WIDTH = 260;

>>>>>>> 277635e (header update)
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

<<<<<<< HEAD
<<<<<<< HEAD
=======
// Define the open and closed drawer styles
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

<<<<<<< HEAD
<<<<<<< HEAD
=======
// Create a custom drawer component
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
const PersistentDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

interface AppLayoutProps {
  children: ReactNode;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 277635e (header update)
// Helper to get page title from path
const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/rules')) return 'Rules Explorer';
  if (pathname.startsWith('/attack-matrix')) return 'ATT&CK Matrix';
<<<<<<< HEAD
<<<<<<< HEAD
  if (pathname.startsWith('/insights')) return 'Security & Platform Insights';
  if (pathname.startsWith('/dashboard')) return 'Security Posture Dashboard';
=======
  if (pathname.startsWith('/insights')) return 'Insights';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
>>>>>>> 277635e (header update)
=======
  if (pathname.startsWith('/insights')) return 'Security & Platform Insights';
  if (pathname.startsWith('/dashboard')) return 'Security Posture Dashboard';
>>>>>>> 6f2e7e2 (header update)
  if (pathname.startsWith('/saved')) return 'Saved Items';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help & Support';
  return 'SAINT Explorer'; // Default title
};


<<<<<<< HEAD
=======
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  toggleTheme, 
  isDarkMode 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpen, toggle: toggleSidebar } = useSidebar();
<<<<<<< HEAD
<<<<<<< HEAD
  const location = useLocation(); // Get current location
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('SAINT Explorer');

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

=======
=======
  const location = useLocation(); // Get current location
>>>>>>> 277635e (header update)
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('SAINT Explorer');

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

<<<<<<< HEAD
  // Handle mobile drawer toggle
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
<<<<<<< HEAD
<<<<<<< HEAD
=======
      {/* AppBar that spans the entire width */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
      <AppBar 
        position="fixed" 
        open={isOpen && !isMobile}
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
<<<<<<< HEAD
<<<<<<< HEAD
=======
          {/* Menu button that's always visible */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? handleMobileDrawerToggle : toggleSidebar}
            sx={{
              mr: 2,
<<<<<<< HEAD
<<<<<<< HEAD
              ...(isOpen && !isMobile && { display: 'none' }), // Hide if desktop sidebar is open
=======
              ...(isOpen && !isMobile && { display: 'none' }),
>>>>>>> a380730 (Initial deployment)
=======
              ...(isOpen && !isMobile && { display: 'none' }), // Hide if desktop sidebar is open
>>>>>>> 277635e (header update)
            }}
          >
            <MenuIcon />
          </IconButton>
          
<<<<<<< HEAD
<<<<<<< HEAD
          <Header 
            pageTitle={pageTitle} // Pass the dynamic page title
=======
          {/* Pass the remaining header space */}
          <Header 
>>>>>>> a380730 (Initial deployment)
=======
          <Header 
            pageTitle={pageTitle} // Pass the dynamic page title
>>>>>>> 277635e (header update)
            toggleTheme={toggleTheme} 
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        </Toolbar>
      </AppBar>
      
<<<<<<< HEAD
<<<<<<< HEAD
=======
      {/* Mobile Drawer */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
<<<<<<< HEAD
<<<<<<< HEAD
            keepMounted: true,
=======
            keepMounted: true, // Better mobile performance
>>>>>>> a380730 (Initial deployment)
=======
            keepMounted: true,
>>>>>>> 23c77cf (code cleanup)
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
<<<<<<< HEAD
<<<<<<< HEAD
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar />  -- This might not be needed if Sidebar content starts below AppBar height */}
          <Sidebar
            width={DRAWER_WIDTH}
            variant="mobile"
            // onClose prop was removed from SidebarProps, Drawer handles its own close
          />
        </Drawer>
      ) : (
=======
          <Toolbar />
=======
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar />  -- This might not be needed if Sidebar content starts below AppBar height */}
>>>>>>> 277635e (header update)
          <Sidebar
            width={DRAWER_WIDTH}
            variant="mobile"
            // onClose prop was removed from SidebarProps, Drawer handles its own close
          />
        </Drawer>
      ) : (
<<<<<<< HEAD
<<<<<<< HEAD
        // Desktop Drawer - This is persistent with an icon when closed
>>>>>>> a380730 (Initial deployment)
=======
        // Desktop Drawer
>>>>>>> 23c77cf (code cleanup)
=======
>>>>>>> 277635e (header update)
        <PersistentDrawer
          variant="permanent"
          open={isOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
        >
<<<<<<< HEAD
<<<<<<< HEAD
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar /> -- This might not be needed if Sidebar content starts below AppBar height */}
          <Sidebar
            width={DRAWER_WIDTH}
            variant="desktop"
            collapsed={!isOpen}
             // onClose prop was removed from SidebarProps
=======
          <Toolbar />
=======
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar /> -- This might not be needed if Sidebar content starts below AppBar height */}
>>>>>>> 277635e (header update)
          <Sidebar
            width={DRAWER_WIDTH}
            variant="desktop"
            collapsed={!isOpen}
<<<<<<< HEAD
>>>>>>> a380730 (Initial deployment)
=======
             // onClose prop was removed from SidebarProps
>>>>>>> 277635e (header update)
          />
        </PersistentDrawer>
      )}
      
<<<<<<< HEAD
<<<<<<< HEAD
=======
      {/* Main content */}
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 277635e (header update)
      <Box
        component="main"
        sx={{
          flexGrow: 1,
<<<<<<< HEAD
<<<<<<< HEAD
          width: '100%', // Ensure it takes full width available
          height: '100%',
          overflow: 'hidden', // Prevent main box from scrolling, content inside will scroll
=======
          width: '100%',
          height: '100%',
          overflow: 'hidden',
>>>>>>> a380730 (Initial deployment)
=======
          width: '100%', // Ensure it takes full width available
          height: '100%',
          overflow: 'hidden', // Prevent main box from scrolling, content inside will scroll
>>>>>>> 277635e (header update)
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        
<<<<<<< HEAD
<<<<<<< HEAD
        <Box
          sx={{
            // p: 3, // Padding is usually applied by individual page components
            flexGrow: 1,
            overflow: 'auto', // This is where the page content will scroll
=======
        {/* Content area with scrolling */}
=======
>>>>>>> 277635e (header update)
        <Box
          sx={{
            // p: 3, // Padding is usually applied by individual page components
            flexGrow: 1,
<<<<<<< HEAD
            overflow: 'auto',
>>>>>>> a380730 (Initial deployment)
=======
            overflow: 'auto', // This is where the page content will scroll
>>>>>>> 277635e (header update)
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;