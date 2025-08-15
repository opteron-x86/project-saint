// src/components/layout/AppLayout.tsx

import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  Toolbar,
  AppBar,
  styled,
  Theme,
  CSSObject
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Header from './Header';
import Sidebar from './Sidebar';
import ClassificationBanner from '../common/ClassificationBanner';
import { useSidebar } from '../../contexts/SidebarContext';

const DRAWER_WIDTH = 260;
const BANNER_HEIGHT = 32;
const APPBAR_HEIGHT = 64;

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
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        position: 'fixed',
        top: BANNER_HEIGHT + APPBAR_HEIGHT,
        height: `calc(100% - ${BANNER_HEIGHT + APPBAR_HEIGHT}px)`,
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        position: 'fixed',
        top: BANNER_HEIGHT + APPBAR_HEIGHT,
        height: `calc(100% - ${BANNER_HEIGHT + APPBAR_HEIGHT}px)`,
      },
    }),
  }),
);

interface AppLayoutProps {
  children: ReactNode;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/rules')) return 'Rules Explorer';
  if (pathname.startsWith('/attack-matrix')) return 'ATT&CK Matrix';
  if (pathname.startsWith('/insights')) return 'Security & Platform Insights';
  if (pathname.startsWith('/dashboard')) return 'Security Posture Dashboard';
  if (pathname.startsWith('/saved')) return 'Saved Items';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help & Support';
  return 'Dashboard';
};

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  toggleTheme, 
  isDarkMode 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>('Dashboard');

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <>
      {/* Classification Banner */}
      <ClassificationBanner 
        level="CUI"
        position="top"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: BANNER_HEIGHT,
          zIndex: theme.zIndex.drawer + 2,
        }}
      />
      
      {/* AppBar - Always full width */}
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{
          top: BANNER_HEIGHT,
          height: APPBAR_HEIGHT,
          zIndex: theme.zIndex.drawer + 1,
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
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Header 
            pageTitle={`SAINT Explorer | ${pageTitle}`}
            toggleTheme={toggleTheme} 
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
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
              top: BANNER_HEIGHT + APPBAR_HEIGHT,
              height: `calc(100% - ${BANNER_HEIGHT + APPBAR_HEIGHT}px)`,
            },
          }}
        >
          <Sidebar
            width={DRAWER_WIDTH}
            variant="mobile"
          />
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <PersistentDrawer
          variant="permanent"
          open={isOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Sidebar
            width={DRAWER_WIDTH}
            variant="desktop"
            collapsed={!isOpen}
          />
        </PersistentDrawer>
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: `${BANNER_HEIGHT + APPBAR_HEIGHT}px`,
          marginLeft: isMobile ? 0 : (isOpen ? `${DRAWER_WIDTH}px` : `${theme.spacing(8)}`),
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: `calc(100vh - ${BANNER_HEIGHT + APPBAR_HEIGHT}px)`,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default AppLayout;