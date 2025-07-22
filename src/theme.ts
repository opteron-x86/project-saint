<<<<<<< HEAD
<<<<<<< HEAD
// src/theme.ts
<<<<<<< HEAD
import { createTheme, ThemeOptions, alpha, Theme, CSSObject } from '@mui/material/styles';
import { SxProps } from '@mui/system';

declare module '@mui/material/styles' {
  interface TypeBackground {
    card: string;
    light: string;
    dark: string;
  }
  interface Palette {
    tertiary: Palette['primary'];
    critical: Palette['error'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    critical?: PaletteOptions['error'];
  }
}

// Color tokens
const tokens = {
  blue: {
    100: '#e6f0ff', 200: '#b3d1ff', 300: '#80b3ff', 400: '#4d94ff', 500: '#1a75ff',
    600: '#0059cc', 700: '#004399', 800: '#002c66', 900: '#001533',
  },
  purple: {
    100: '#f0e6ff', 200: '#d4bfff', 300: '#b999ff', 400: '#9d73ff', 500: '#824dff',
    600: '#6932cc', 700: '#4f2699', 800: '#361966', 900: '#1d0d33',
  },
  cyan: {
    100: '#e6f9ff', 200: '#b3eeff', 300: '#80e3ff', 400: '#4dd8ff', 500: '#1acdff',
    600: '#00a4cc', 700: '#007b99', 800: '#005266', 900: '#002933',
  },
  red: {
    100: '#ffe6e6', 200: '#ffb3b3', 300: '#ff8080', 400: '#ff4d4d', 500: '#ff1a1a',
    600: '#cc0000', 700: '#990000', 800: '#660000', 900: '#330000',
  },
  green: {
    100: '#e6fff2', 200: '#b3ffe0', 300: '#80ffce', 400: '#4dffbd', 500: '#1affab',
    600: '#00cc88', 700: '#009966', 800: '#006644', 900: '#003322',
  },
  grey: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
  },
};


const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: { main: tokens.blue[500], light: tokens.blue[300], dark: tokens.blue[700], contrastText: '#ffffff' },
    secondary: { main: tokens.purple[500], light: tokens.purple[300], dark: tokens.purple[700], contrastText: '#ffffff' },
    tertiary: { main: tokens.cyan[500], light: tokens.cyan[300], dark: tokens.cyan[700], contrastText: '#ffffff' },
    error: { main: tokens.red[500], light: tokens.red[300], dark: tokens.red[700] },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info: { main: tokens.cyan[500], light: tokens.cyan[300], dark: tokens.cyan[700] },
    success: { main: tokens.green[600], light: tokens.green[400], dark: tokens.green[800] },
    critical: { main: '#B91C1C', light: '#FEE2E2', dark: '#DC2626' },
    grey: tokens.grey,
    background: { default: tokens.grey[50], paper: '#ffffff', card: '#ffffff', light: tokens.grey[50], dark: tokens.grey[200] },
=======

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
import { CSSInterpolation } from '@mui/system'; // For typing styleOverrides
=======
=======
// src/theme.ts
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
import { createTheme, ThemeOptions, alpha, Theme, CSSObject } from '@mui/material/styles';
import { SxProps } from '@mui/system';
>>>>>>> 30da590 (typescript error hunting)

declare module '@mui/material/styles' {
  interface TypeBackground {
    card: string;
    light: string;
    dark: string;
  }
  interface Palette {
    tertiary: Palette['primary'];
    critical: Palette['error'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    critical?: PaletteOptions['error'];
  }
}

// Color tokens
const tokens = {
  blue: {
    100: '#e6f0ff', 200: '#b3d1ff', 300: '#80b3ff', 400: '#4d94ff', 500: '#1a75ff',
    600: '#0059cc', 700: '#004399', 800: '#002c66', 900: '#001533',
  },
  purple: {
    100: '#f0e6ff', 200: '#d4bfff', 300: '#b999ff', 400: '#9d73ff', 500: '#824dff',
    600: '#6932cc', 700: '#4f2699', 800: '#361966', 900: '#1d0d33',
  },
  cyan: {
    100: '#e6f9ff', 200: '#b3eeff', 300: '#80e3ff', 400: '#4dd8ff', 500: '#1acdff',
    600: '#00a4cc', 700: '#007b99', 800: '#005266', 900: '#002933',
  },
  red: {
    100: '#ffe6e6', 200: '#ffb3b3', 300: '#ff8080', 400: '#ff4d4d', 500: '#ff1a1a',
    600: '#cc0000', 700: '#990000', 800: '#660000', 900: '#330000',
  },
  green: {
    100: '#e6fff2', 200: '#b3ffe0', 300: '#80ffce', 400: '#4dffbd', 500: '#1affab',
    600: '#00cc88', 700: '#009966', 800: '#006644', 900: '#003322',
  },
  grey: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
  },
};


const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: { main: tokens.blue[500], light: tokens.blue[300], dark: tokens.blue[700], contrastText: '#ffffff' },
    secondary: { main: tokens.purple[500], light: tokens.purple[300], dark: tokens.purple[700], contrastText: '#ffffff' },
    tertiary: { main: tokens.cyan[500], light: tokens.cyan[300], dark: tokens.cyan[700], contrastText: '#ffffff' },
    error: { main: tokens.red[500], light: tokens.red[300], dark: tokens.red[700] },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info: { main: tokens.cyan[500], light: tokens.cyan[300], dark: tokens.cyan[700] },
    success: { main: tokens.green[600], light: tokens.green[400], dark: tokens.green[800] },
    critical: { main: '#B91C1C', light: '#FEE2E2', dark: '#DC2626' },
    grey: tokens.grey,
<<<<<<< HEAD
    background: { // Now TypeScript knows 'card', 'light', 'dark' can be part of TypeBackground
      default: tokens.grey[50],
      paper: '#ffffff',
      card: '#ffffff',      // Custom property
      light: tokens.grey[50], // Custom property
      dark: tokens.grey[200], // Custom property
    },
>>>>>>> a380730 (Initial deployment)
=======
    background: { default: tokens.grey[50], paper: '#ffffff', card: '#ffffff', light: tokens.grey[50], dark: tokens.grey[200] },
>>>>>>> 30da590 (typescript error hunting)
    divider: tokens.grey[200],
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30da590 (typescript error hunting)
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 }, h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 }, h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 }, h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }, subtitle2: { fontSize: '0.875rem', lineHeight: 1.57, fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 }, body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    button: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57, textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.66 }, overline: { fontSize: '0.75rem', lineHeight: 1.66, textTransform: 'uppercase', fontWeight: 600 },
<<<<<<< HEAD
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { fontWeight: 600, textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
=======
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
=======
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2, },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2, },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2, },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2, },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2, },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2, },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, },
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.57, fontWeight: 500, },
    body1: { fontSize: '1rem', lineHeight: 1.5, },
    body2: { fontSize: '0.875rem', lineHeight: 1.57, },
    button: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57, textTransform: 'none', },
    caption: { fontSize: '0.75rem', lineHeight: 1.66, },
    overline: { fontSize: '0.75rem', lineHeight: 1.66, textTransform: 'uppercase', fontWeight: 600, },
>>>>>>> 539e54d (Fixed theme.ts)
  },
  shape: {
    borderRadius: 8,
=======
>>>>>>> 30da590 (typescript error hunting)
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
<<<<<<< HEAD
        root: {
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', },
        },
>>>>>>> a380730 (Initial deployment)
=======
        root: { fontWeight: 600, textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
>>>>>>> 30da590 (typescript error hunting)
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
<<<<<<< HEAD
<<<<<<< HEAD
        html: { height: '100%', width: '100%', scrollBehavior: 'smooth' },
        body: { 
=======
        html: { height: '100%', width: '100%', scrollBehavior: 'smooth' },
<<<<<<< HEAD
        body: { // This is a CSSObject
>>>>>>> 30da590 (typescript error hunting)
=======
        body: { 
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
          height: '100%', width: '100%', scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: tokens.grey[300], borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: tokens.grey[400] },
          '& #root': { height: '100%', width: '100%' },
<<<<<<< HEAD
<<<<<<< HEAD
        } as CSSObject, 
=======
        html: {
          height: '100%',
          width: '100%',
          scrollBehavior: 'smooth',
        },
        body: {
          height: '100%',
          width: '100%',
          scrollbarWidth: 'thin', // For Firefox
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: tokens.grey[300], // Base scrollbar thumb color
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: tokens.grey[400], // Base scrollbar thumb hover color
          },
          '& #root': {
            height: '100%',
            width: '100%',
          },
<<<<<<< HEAD
        },
>>>>>>> a380730 (Initial deployment)
=======
        } as CSSInterpolation, // Added CSSInterpolation type for 'body'
>>>>>>> 539e54d (Fixed theme.ts)
=======
        } as CSSObject, // Explicitly type as CSSObject for clarity
>>>>>>> 30da590 (typescript error hunting)
=======
        } as CSSObject, 
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
      },
    },
    MuiCard: {
      styleOverrides: {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        root: { 
=======
        root: {
>>>>>>> a380730 (Initial deployment)
=======
        root: { // This is SxProps<Theme> which is compatible with CSSObject
>>>>>>> 30da590 (typescript error hunting)
=======
        root: { 
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
<<<<<<< HEAD
<<<<<<< HEAD
    MuiCardHeader: { styleOverrides: { root: { padding: '16px 24px' } } },
    MuiCardContent: { styleOverrides: { root: { padding: '24px', '&:last-child': { paddingBottom: '24px' } } } },
    MuiListItemButton: {
      styleOverrides: {
        root: { 
<<<<<<< HEAD
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.blue[500], 0.12), color: tokens.blue[600],
            '&:hover': { backgroundColor: alpha(tokens.blue[500], 0.18) },
=======
    MuiCardHeader: {
=======
    MuiCardHeader: { styleOverrides: { root: { padding: '16px 24px' } } },
    MuiCardContent: { styleOverrides: { root: { padding: '24px', '&:last-child': { paddingBottom: '24px' } } } },
    MuiListItemButton: {
>>>>>>> 30da590 (typescript error hunting)
      styleOverrides: {
        root: { // This is SxProps<Theme>
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.blue[500], 0.12), color: tokens.blue[600],
            '&:hover': { backgroundColor: alpha(tokens.blue[500], 0.18) },
          },
        },
      },
    },
  },
};

export const lightTheme: Theme = createTheme(baseThemeOptions);

const darkThemeOverrides: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: tokens.grey[900],
      paper: tokens.grey[800],
      card: tokens.grey[800],
      light: tokens.grey[700],
      dark: tokens.grey[900],
    },
    text: {
      primary: tokens.grey[50],
      secondary: tokens.grey[300],
    },
    divider: alpha(tokens.grey[500], 0.2),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar-thumb': {
            background: tokens.grey[600],
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: tokens.grey[500],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          backgroundColor: tokens.grey[800],
          boxShadow: `0 1px 3px 0 ${alpha('#000', 0.2)}, 0 1px 2px 0 ${alpha('#000', 0.3)}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { 
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.blue[700], 0.4),
            color: tokens.blue[300],
            '&:hover': {
              backgroundColor: alpha(tokens.blue[700], 0.5),
            },
>>>>>>> a380730 (Initial deployment)
          },
        },
      },
    },
  },
};

<<<<<<< HEAD
<<<<<<< HEAD
export const lightTheme: Theme = createTheme(baseThemeOptions);

const darkThemeOverrides: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: tokens.grey[900],
=======
// Create light theme
export const lightTheme = createTheme({
  ...baseThemeOptions, // Spread base options
  palette: { // Override or extend palette
    ...baseThemeOptions.palette, // Spread base palette
    mode: 'light',
    // Any light-theme specific palette overrides can go here
    // background.card, light, dark are already defined in baseThemeOptions.palette.background
  },
});

// Create dark theme
export const darkTheme = createTheme({
  ...baseThemeOptions, // Spread base options
  palette: {
    ...baseThemeOptions.palette, // Spread base palette
    mode: 'dark',
<<<<<<< HEAD
    background: {
      default: tokens.grey[900], // Deep dark blue-gray
>>>>>>> a380730 (Initial deployment)
=======
    background: { // Override the entire background object for dark theme
      default: tokens.grey[900],
>>>>>>> 539e54d (Fixed theme.ts)
      paper: tokens.grey[800],
      card: tokens.grey[800],   // Custom property for dark theme
      light: tokens.grey[700],  // Custom property for dark theme
      dark: tokens.grey[900],   // Custom property for dark theme
    },
    text: {
      primary: tokens.grey[50],
      secondary: tokens.grey[300],
    },
    divider: alpha(tokens.grey[500], 0.2),
  },
  components: {
<<<<<<< HEAD
<<<<<<< HEAD
    MuiCssBaseline: {
      styleOverrides: {
        body: {
=======
    ...baseThemeOptions.components,
=======
    ...baseThemeOptions.components, // Spread base components
>>>>>>> 539e54d (Fixed theme.ts)
    MuiCssBaseline: {
      styleOverrides: {
        // Spread all styleOverrides from base MuiCssBaseline to inherit html, etc.
        ...(baseThemeOptions.components?.MuiCssBaseline?.styleOverrides || {}),
        body: {
<<<<<<< HEAD
          ...(baseThemeOptions.components?.MuiCssBaseline?.styleOverrides as any).body,
>>>>>>> a380730 (Initial deployment)
=======
          // Spread body styles from base MuiCssBaseline
          ...((baseThemeOptions.components?.MuiCssBaseline?.styleOverrides as Record<string, any>)?.body || {}),
          // Dark theme specific scrollbar overrides
>>>>>>> 539e54d (Fixed theme.ts)
          '&::-webkit-scrollbar-thumb': {
            background: tokens.grey[600],
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: tokens.grey[500],
          },
        } as CSSInterpolation, // Added CSSInterpolation type for 'body'
      },
    },
    MuiCard: { // Override MuiCard for dark theme if needed
      styleOverrides: {
<<<<<<< HEAD
<<<<<<< HEAD
        root: { 
          backgroundColor: tokens.grey[800],
          boxShadow: `0 1px 3px 0 ${alpha('#000', 0.2)}, 0 1px 2px 0 ${alpha('#000', 0.3)}`,
=======
        root: {
          backgroundColor: tokens.grey[800],
          boxShadow: `0 1px 3px 0 ${alpha('#000', 0.2)}, 0 1px 2px 0 ${alpha('#000', 0.3)}`,
          borderRadius: 12,
>>>>>>> a380730 (Initial deployment)
=======
        ...(baseThemeOptions.components?.MuiCard?.styleOverrides || {}), // Spread base card styles
        root: { // Specific dark theme overrides for Card root
          backgroundColor: tokens.grey[800], // Ensure card uses dark background
          boxShadow: `0 1px 3px 0 ${alpha('#000', 0.2)}, 0 1px 2px 0 ${alpha('#000', 0.3)}`,
          borderRadius: 12, // Retain or override base
>>>>>>> 539e54d (Fixed theme.ts)
        },
      },
    },
    MuiListItemButton: { // Override MuiListItemButton for dark theme
      styleOverrides: {
<<<<<<< HEAD
<<<<<<< HEAD
        root: { 
=======
        root: {
>>>>>>> a380730 (Initial deployment)
=======
        ...(baseThemeOptions.components?.MuiListItemButton?.styleOverrides || {}),
        root: { // Specific dark theme overrides for ListItemButton root
>>>>>>> 539e54d (Fixed theme.ts)
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.blue[700], 0.4), // Darker selected background
            color: tokens.blue[300], // Lighter selected text
            '&:hover': {
              backgroundColor: alpha(tokens.blue[700], 0.5),
            },
          },
        },
      },
    },
    // You can add other component overrides specific to darkTheme here
  },
<<<<<<< HEAD
};

// Create the dark theme by deeply merging baseThemeOptions with darkThemeOverrides
export const darkTheme: Theme = createTheme(baseThemeOptions, darkThemeOverrides);
=======
});
>>>>>>> a380730 (Initial deployment)

export default lightTheme; // Or conditionally export based on a preference
=======
// Create the dark theme by deeply merging baseThemeOptions with darkThemeOverrides
export const darkTheme: Theme = createTheme(baseThemeOptions, darkThemeOverrides);

<<<<<<< HEAD
export default lightTheme;
>>>>>>> 30da590 (typescript error hunting)
=======
export default lightTheme;
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
