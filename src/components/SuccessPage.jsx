import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Header from './Header';

const SuccessPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Include the Header component */}
      {/* <Header /> */}
      
      {/* Success content */}
      <Box 
        sx={{ 
          minHeight: { xs: 'calc(100vh - 64px)', sm: '80vh' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        {/* Green circle with checkmark */}
        <Box 
          sx={{ 
            width: { xs: 80, sm: 100, md: 120 },
            height: { xs: 80, sm: 100, md: 120 },
            borderRadius: '50%',
            bgcolor: '#8BC34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 2, sm: 3, md: 4 },
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(139, 195, 74, 0.3)'
            }
          }}
        >
          <CheckCircleIcon 
            sx={{ 
              color: 'white',
              fontSize: { xs: 40, sm: 50, md: 60 },
              transition: 'all 0.3s ease-in-out'
            }} 
          />
        </Box>

        {/* Thank you text */}
        <Typography 
          variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h3'} 
          sx={{ 
            fontWeight: 'bold',
            mb: { xs: 1.5, sm: 2, md: 3 },
            textAlign: 'center',
            color: '#2d2d2d',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          THANK YOU!
        </Typography>

        {/* Success message */}
        <Typography 
          variant={isMobile ? 'body2' : 'body1'} 
          sx={{ 
            textAlign: 'center',
            maxWidth: { xs: '100%', sm: '80%', md: '600px' },
            color: '#555',
            lineHeight: { xs: 1.5, sm: 1.6, md: 1.8 },
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            px: { xs: 2, sm: 4 },
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          Your detail has been successfully submitted. We will verify your detail and confirm you via E-mail.
        </Typography>

        {/* Additional container for potential future content */}
        <Box 
          sx={{ 
            width: '100%',
            mt: { xs: 4, sm: 6, md: 8 },
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {/* You can add additional elements here if needed */}
        </Box>
      </Box>
    </Box>
  );
};

export default SuccessPage; 