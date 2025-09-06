// Button style variants for consistent styling across the application

export const buttonStyles = {
  // Primary button style
  primary: {
    backgroundColor: '#75A5A3',
    color: 'white',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(117, 165, 163, 0.3)',
    '&:hover': {
      backgroundColor: '#638e8c',
      boxShadow: '0 4px 12px rgba(117, 165, 163, 0.4)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      color: '#999',
      boxShadow: 'none',
      transform: 'none',
    },
  },

  // Secondary button style
  secondary: {
    backgroundColor: 'transparent',
    color: '#75A5A3',
    border: '2px solid #75A5A3',
    borderRadius: '8px',
    padding: '10px 22px',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(117, 165, 163, 0.1)',
      borderColor: '#638e8c',
    },
    '&:disabled': {
      borderColor: '#ccc',
      color: '#999',
    },
  },

  // Success button style
  success: {
    backgroundColor: '#8BC34A',
    color: 'white',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(139, 195, 74, 0.3)',
    '&:hover': {
      backgroundColor: '#7CB342',
      boxShadow: '0 4px 12px rgba(139, 195, 74, 0.4)',
    },
  },

  // Error/danger button style
  error: {
    backgroundColor: '#E53935',
    color: 'white',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(229, 57, 53, 0.3)',
    '&:hover': {
      backgroundColor: '#C62828',
      boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)',
    },
  },

  // Large button variant
  large: {
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: '12px',
  },

  // Small button variant
  small: {
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '6px',
  },

  // Floating action button style
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#75A5A3',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    '&:hover': {
      backgroundColor: '#638e8c',
      transform: 'scale(1.1)',
    },
  },
};

export default buttonStyles;
