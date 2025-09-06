import { createTheme } from '@mui/material/styles';

// Custom theme configuration for Co-Hopers application
const theme = createTheme({
  palette: {
    primary: {
      main: '#2d2d2d',
      light: '#5d5d5d',
      dark: '#1a1a1a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00e5ff',
      light: '#62f3ff',
      dark: '#00b2cc',
      contrastText: '#000000',
    },
    accent: {
      main: '#75A5A3',
      light: '#9FE2DF',
      dark: '#638e8c',
      contrastText: '#ffffff',
    },
    success: {
      main: '#8BC34A',
      light: '#8bc34a',
      dark: '#7CB342',
      contrastText: '#ffffff',
    },
    error: {
      main: '#E53935',
      light: '#ef5350',
      dark: '#C62828',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#2d2d2d',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
  },
});

export default theme;
