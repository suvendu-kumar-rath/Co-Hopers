import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable Loading Spinner Component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {boolean} props.overlay - Whether to show as overlay
 */
const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  overlay = false 
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 60;
      default: return 40;
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress 
        size={getSizeValue()} 
        sx={{ color: '#75A5A3' }}
      />
      {message && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
