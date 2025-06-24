import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import ServiceImage from '../assets/images/footer image.png';

const Footer = () => {
  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5',
      py: 4,
      borderTop: '1px solid #e0e0e0'
    }}>
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '25%' }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontSize: '2.2rem',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#000',
                marginLeft: '-120px',
                whiteSpace: 'nowrap',
                width: 'fit-content'
              }}
            >
              Let's Keep in Touch
            </Typography>
            <Typography 
              variant="h3" 
              component="div"
              sx={{ 
                fontSize: '2.2rem',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#000',
                mt: 1,
                marginLeft: '-110px',
                whiteSpace: 'nowrap',
                width: 'fit-content'
              }}
            >
              with us!
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5,
            marginLeft: '-400px'
          }}>
            {['Home', 'About Us', 'Services', 'Meeting Rooms', 'Contact us'].map((item) => (
              <Link
                key={item}
                href="#"
                sx={{
                  color: '#000',
                  textDecoration: 'underline',
                  fontSize: '1rem',
                  '&:hover': { color: '#000' }
                }}
              >
                {item}
              </Link>
            ))}
          </Box>
        </Box>

        {/* Middle Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '35%',
          mt: 12,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Typography 
            sx={{ 
              fontSize: '1rem',
              color: '#000',
              mb: 2,
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            Contact Us to explore the endless possibilities of joining the vibrant Cohopers coworking community.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
            {['facebook', 'instagram', 'linkedin', 'google'].map((social) => (
              <Box
                key={social}
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Right Section - Image */}
        <Box sx={{ 
          width: '35%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: "-150px"
        }}>
          <img 
            src={ServiceImage} 
            alt="Office Space" 
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </Box>
      </Container>

      {/* Bottom Section */}
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 3,
            pt: 2,
            color: '#000',
            marginRight: "-100px"
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.875rem',
              marginLeft: '-150px'
            }}
          >
            Copyright © 2024. Cohopers. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            9C Technology Labs Private Limited
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 