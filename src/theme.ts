// src/theme.ts
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
    divider: tokens.grey[200],
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 }, h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 }, h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 }, h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }, subtitle2: { fontSize: '0.875rem', lineHeight: 1.57, fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 }, body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    button: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57, textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.66 }, overline: { fontSize: '0.75rem', lineHeight: 1.66, textTransform: 'uppercase', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { fontWeight: 600, textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%', width: '100%', scrollBehavior: 'smooth' },
        body: { 
          height: '100%', width: '100%', scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: tokens.grey[300], borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: tokens.grey[400] },
          '& #root': { height: '100%', width: '100%' },
        } as CSSObject, 
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiCardHeader: { styleOverrides: { root: { padding: '16px 24px' } } },
    MuiCardContent: { styleOverrides: { root: { padding: '24px', '&:last-child': { paddingBottom: '24px' } } } },
    MuiListItemButton: {
      styleOverrides: {
        root: { 
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
          },
        },
      },
    },
  },
};

// Create the dark theme by deeply merging baseThemeOptions with darkThemeOverrides
export const darkTheme: Theme = createTheme(baseThemeOptions, darkThemeOverrides);

export default lightTheme;