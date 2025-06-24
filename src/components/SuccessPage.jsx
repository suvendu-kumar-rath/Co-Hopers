import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Header from './Header';

const SuccessPage = () => {
  return (
    <Box>
      {/* Include the Header component */}
      {/* <Header /> */}
      
      {/* Success content */}
      <Box 
        sx={{ 
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 4,
          px: 2
        }}
      >
        {/* Green circle with checkmark */}
        <Box 
          sx={{ 
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: '#8BC34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <CheckCircleIcon 
            sx={{ 
              color: 'white',
              fontSize: 60
            }} 
          />
        </Box>

        {/* Thank you text */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center'
          }}
        >
          THANK YOU!
        </Typography>

        {/* Success message */}
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center',
            maxWidth: 600,
            color: '#333'
          }}
        >
          Your detail has been successfully submitted. We will verify your detail and confirm you via E-mail.
        </Typography>
      </Box>
    </Box>
  );
};

export default SuccessPage; 