// Card style variants for consistent card styling

export const cardStyles = {
  // Default card style
  default: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '24px',
    backgroundColor: 'white',
    border: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    },
  },

  // Elevated card style
  elevated: {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    padding: '32px',
    backgroundColor: 'white',
    border: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
      transform: 'translateY(-4px)',
    },
  },

  // Outlined card style
  outlined: {
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    padding: '24px',
    backgroundColor: 'white',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#75A5A3',
      boxShadow: '0 4px 12px rgba(117, 165, 163, 0.1)',
    },
  },

  // Success card style
  success: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(139, 195, 74, 0.2)',
    padding: '24px',
    backgroundColor: 'rgba(139, 195, 74, 0.05)',
    border: '1px solid rgba(139, 195, 74, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(139, 195, 74, 0.1)',
      boxShadow: '0 4px 16px rgba(139, 195, 74, 0.3)',
    },
  },

  // Warning card style
  warning: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)',
    padding: '24px',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    border: '1px solid rgba(255, 152, 0, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
    },
  },

  // Error card style
  error: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(229, 57, 53, 0.2)',
    padding: '24px',
    backgroundColor: 'rgba(229, 57, 53, 0.05)',
    border: '1px solid rgba(229, 57, 53, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(229, 57, 53, 0.1)',
      boxShadow: '0 4px 16px rgba(229, 57, 53, 0.3)',
    },
  },

  // Info card style
  info: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
    padding: '24px',
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    border: '1px solid rgba(33, 150, 243, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
    },
  },

  // Compact card style
  compact: {
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    padding: '16px',
    backgroundColor: 'white',
    border: 'none',
  },

  // Interactive card style (for clickable cards)
  interactive: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '24px',
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transform: 'translateY(-4px)',
      backgroundColor: '#fafafa',
    },
    '&:active': {
      transform: 'translateY(-2px)',
    },
  },
};

export default cardStyles;
