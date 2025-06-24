import React from 'react';
import { Box, Container, Typography, Link, useTheme, useMediaQuery, Grid } from '@mui/material';
import ServiceImage from '../assets/images/footer image.png';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5',
      py: { xs: 3, sm: 4, md: 4 },
      borderTop: '1px solid #e0e0e0'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} alignItems="flex-start">
          {/* Left Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: { xs: 'center', sm: 'flex-start' }
            }}>
              <Box sx={{ 
                mb: { xs: 2, sm: 3 },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Typography 
                  variant="h3" 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: '#000',
                    width: 'fit-content'
                  }}
                >
                  Let's Keep in Touch
                </Typography>
                <Typography 
                  variant="h3" 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: '#000',
                    mt: 1,
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
                alignItems: { xs: 'center', sm: 'flex-start' }
              }}>
                {['Home', 'About Us', 'Services', 'Meeting Rooms', 'Contact us'].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: '#000',
                      textDecoration: 'underline',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&:hover': { 
                        color: '#000',
                        opacity: 0.8 
                      }
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Middle Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              mt: { xs: 2, sm: 0 }
            }}>
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: '#000',
                  mb: 2,
                  maxWidth: '400px',
                  textAlign: 'center',
                  px: { xs: 2, sm: 0 }
                }}
              >
                Contact Us to explore the endless possibilities of joining the vibrant Cohopers coworking community.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5 }, 
                mt: 1.5,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {['facebook', 'instagram', 'linkedin', 'google'].map((social) => (
                  <Box
                    key={social}
                    sx={{
                      width: { xs: 30, sm: 35 },
                      height: { xs: 30, sm: 35 },
                      borderRadius: '50%',
                      bgcolor: '#fff',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Section - Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: { xs: 2, sm: 0 }
            }}>
              <img 
                src={ServiceImage} 
                alt="Office Space" 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  minHeight: '150px',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'center', sm: 'flex-start' },
            mt: { xs: 4, sm: 5 },
            pt: 2,
            color: '#000',
            borderTop: '1px solid #e0e0e0',
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Copyright © 2024. Cohopers. All rights reserved.
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: { xs: 'center', sm: 'right' }
            }}
          >
            9C Technology Labs Private Limited
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 