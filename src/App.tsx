// src/App.tsx
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, Button, Typography, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from '@/theme';
import AppRoutes from '@/routes';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from "react-oidc-context"; 

const LoggedOut = lazy(() => import('@/pages/LoggedOut'));

const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
    </Box>
);

const SignInPage = () => {
    const auth = useAuth();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: { xs: 3, sm: 5 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 'sm', 
              width: '90%',
            }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                SAINT Explorer
              </Typography>
              <Box
                component="img"
                src="/saint.svg"
                alt="SAINT Logo"
                sx={{
                  width: { xs: 200, sm: 250, md: 300 },
                  height: { xs: 200, sm: 250, md: 300 },
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => auth.signinRedirect()}
                sx={{ mt: 2, minWidth: '120px' }}
              >
                Sign In
              </Button>
            </Box>
        </Box>
    );
};


function App() {
  const auth = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (auth.isLoading) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <LoadingFallback />
      </ThemeProvider>
    );
  }

  if (auth.error) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
          <Typography color="error" variant="h6">Authentication Error</Typography>
          <Typography color="error" sx={{ mb: 2 }}>{auth.error.message}</Typography>
          <Button variant="contained" onClick={() => auth.signinRedirect()}>Try Sign In Again</Button>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: '#28a745', color: '#ffffff' } },
          error: { style: { background: '#dc3545', color: '#ffffff' } },
        }}
      />
      <Router>
        {auth.isAuthenticated ? (
          <SidebarProvider>
            <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
              <AppRoutes toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            </Box>
          </SidebarProvider>
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/logged-out" element={<LoggedOut />} />
              <Route path="*" element={<SignInPage />} />
            </Routes>
          </Suspense>
        )}
=======

=======
>>>>>>> 6acc8f7 (Feature/authenticator)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
=======
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
>>>>>>> bae12e2 (Feature/dashboard improvements)
import { Box, ThemeProvider, CssBaseline, Button, Typography, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from '@/theme';
import AppRoutes from '@/routes';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from "react-oidc-context"; 

const LoggedOut = lazy(() => import('@/pages/LoggedOut'));

const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
    </Box>
);

const SignInPage = () => {
    const auth = useAuth();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: { xs: 3, sm: 5 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 'sm', 
              width: '90%',
            }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                SAINT Explorer
              </Typography>
              <Box
                component="img"
                src="/saint.svg"
                alt="SAINT Logo"
                sx={{
                  width: { xs: 200, sm: 250, md: 300 },
                  height: { xs: 200, sm: 250, md: 300 },
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => auth.signinRedirect()}
                sx={{ mt: 2, minWidth: '120px' }}
              >
                Sign In
              </Button>
            </Box>
        </Box>
    );
};


function App() {
  const auth = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (auth.isLoading) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <LoadingFallback />
      </ThemeProvider>
    );
  }

  if (auth.error) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
          <Typography color="error" variant="h6">Authentication Error</Typography>
          <Typography color="error" sx={{ mb: 2 }}>{auth.error.message}</Typography>
          <Button variant="contained" onClick={() => auth.signinRedirect()}>Try Sign In Again</Button>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
<<<<<<< HEAD
      <CssBaseline /> {/* Apply baseline styling */}
      <Router>
        <SidebarProvider>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            }}
          >
            <AppRoutes toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
          </Box>
        </SidebarProvider>
>>>>>>> a380730 (Initial deployment)
      </Router>
=======
      <CssBaseline />
<<<<<<< HEAD
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: { xs: 3, sm: 5 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 'sm', 
          width: '90%',
        }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            SAINT Explorer
          </Typography>
          <Box
            component="img"
            src="/saint3.svg"
            alt="SAINT Logo"
            sx={{
              width: { xs: 200, sm: 250, md: 300 }, // Responsive size
              height: { xs: 200, sm: 250, md: 300 },
              transition: 'transform 0.3s ease-in-out',
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={() => auth.signinRedirect()}
            sx={{ mt: 2, minWidth: '120px' }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
>>>>>>> 6acc8f7 (Feature/authenticator)
=======
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: '#28a745', color: '#ffffff' } },
          error: { style: { background: '#dc3545', color: '#ffffff' } },
        }}
      />
      <Router>
        {auth.isAuthenticated ? (
          <SidebarProvider>
            <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
              <AppRoutes toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            </Box>
          </SidebarProvider>
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/logged-out" element={<LoggedOut />} />
              <Route path="*" element={<SignInPage />} />
            </Routes>
          </Suspense>
        )}
      </Router>
>>>>>>> bae12e2 (Feature/dashboard improvements)
    </ThemeProvider>
  );
}

export default App;