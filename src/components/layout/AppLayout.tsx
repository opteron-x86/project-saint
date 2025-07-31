// src/components/layout/AppLayout.tsx

import React, { ReactNode, useState, useEffect } from 'react'; // Added useEffect
import { useLocation } from 'react-router-dom'; // Added useLocation
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
// ChevronLeftIcon was removed as it's unused here
import Header from './Header';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';

const DRAWER_WIDTH = 260;

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

// Helper to get page title from path
const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/rules')) return 'Rules Explorer';
  if (pathname.startsWith('/attack-matrix')) return 'ATT&CK Matrix';
  if (pathname.startsWith('/insights')) return 'Security & Platform Insights';
  if (pathname.startsWith('/dashboard')) return 'Security Posture Dashboard';
  if (pathname.startsWith('/saved')) return 'Saved Items';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help & Support';
  return 'SAINT Explorer'; // Default title
};


const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  toggleTheme, 
  isDarkMode 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const location = useLocation(); // Get current location
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('SAINT Explorer');

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? handleMobileDrawerToggle : toggleSidebar}
            sx={{
              mr: 2,
              ...(isOpen && !isMobile && { display: 'none' }), // Hide if desktop sidebar is open
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Header 
            pageTitle={pageTitle} // Pass the dynamic page title
            toggleTheme={toggleTheme} 
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        </Toolbar>
      </AppBar>
      
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar />  -- This might not be needed if Sidebar content starts below AppBar height */}
          <Sidebar
            width={DRAWER_WIDTH}
            variant="mobile"
            // onClose prop was removed from SidebarProps, Drawer handles its own close
          />
        </Drawer>
      ) : (
        <PersistentDrawer
          variant="permanent"
          open={isOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
        >
          {/* Toolbar to create space for AppBar */}
          {/* <Toolbar /> -- This might not be needed if Sidebar content starts below AppBar height */}
          <Sidebar
            width={DRAWER_WIDTH}
            variant="desktop"
            collapsed={!isOpen}
             // onClose prop was removed from SidebarProps
          />
        </PersistentDrawer>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%', // Ensure it takes full width available
          height: '100%',
          overflow: 'hidden', // Prevent main box from scrolling, content inside will scroll
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        
        <Box
          sx={{
            // p: 3, // Padding is usually applied by individual page components
            flexGrow: 1,
            overflow: 'auto', // This is where the page content will scroll
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