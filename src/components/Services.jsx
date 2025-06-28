import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Paper, Fade, Input, Divider, TextField, InputAdornment, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import privateOfficeJpg from '../assets/images/private office.jpg';
import spaceImage4 from '../assets/images/03_Spaces 4.png';
import spaceImage6 from '../assets/images/03_Spaces 6.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import directorKYCImage from '../assets/images/KYC.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KYCImage from '../assets/images/KYC.png';
import CloseIcon from '@mui/icons-material/Close';

const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();
  const { officeType, id } = useParams();

  // State for popup modal and slider
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Private Office Data
  const privateOffices = [
    {
      id: 'executive-cabin-3',
      title: 'Executive Cabin (3 Seater)',
      price: '₹16k + GST',
      image: privateOfficeJpg,
      description: '3 Seater including 1 Boss seat',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'window-executive-4',
      title: 'Window Side Executive Cabin (4 Seater)',
      price: '₹18k + GST',
      image: privateOfficeJpg,
      description: '4 Seater including 1 Boss seat',
      isAvailable: false,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'private-cabin-4',
      title: 'Private Cabin (4 Seater)',
      price: '₹17k + GST',
      image: privateOfficeJpg,
      description: '4 Seater',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'private-cabin-6',
      title: 'Private Cabin (6 Seater)',
      price: '₹20k + GST',
      image: privateOfficeJpg,
      description: '6 Seater',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'premium-cabin-8',
      title: 'Premium Cabin (8 Seater)',
      price: '₹24k + GST',
      image: privateOfficeJpg,
      description: '8 Seater Luxury Space',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'team-space-10',
      title: 'Team Space (10 Seater)',
      price: '₹28k + GST',
      image: privateOfficeJpg,
      description: '10 Seater Collaborative Space',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'executive-suite-12',
      title: 'Executive Suite (12 Seater)',
      price: '₹32k + GST',
      image: privateOfficeJpg,
      description: '12 Seater Premium Suite',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'corporate-space-15',
      title: 'Corporate Space (15 Seater)',
      price: '₹38k + GST',
      image: privateOfficeJpg,
      description: '15 Seater Corporate Environment',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'business-hub-20',
      title: 'Business Hub (20 Seater)',
      price: '₹45k + GST',
      image: privateOfficeJpg,
      description: '20 Seater Business Center',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    },
    {
      id: 'enterprise-space-25',
      title: 'Enterprise Space (25 Seater)',
      price: '₹52k + GST',
      image: privateOfficeJpg,
      description: '25 Seater Enterprise Solution',
      isAvailable: true,
      features: [
        '24/7 access',
        'Conference room facility',
        '300 MBPS internet',
        'Price includes electricity, AC, Office boy'
      ]
    }
  ];

  // Virtual Office Data (commented out)
  // const virtualOffices = [
  //   {
  //     id: 'virtual-basic',
  //     title: 'Virtual Office Basic',
  //     price: '₹5k + GST',
  //     image: privateOfficeImage,
  //     description: 'Basic virtual office services',
  //     features: [
  //       'Business address',
  //       'Mail handling',
  //       'Phone answering',
  //       'Meeting room access'
  //     ]
  //   },
  //   {
  //     id: 'virtual-premium',
  //     title: 'Virtual Office Premium',
  //     price: '₹8k + GST',
  //     image: privateOfficeImage,
  //     description: 'Premium virtual office services',
  //     features: [
  //       'Business address',
  //       'Mail handling',
  //       'Phone answering',
  //       'Meeting room access',
  //       'Reception services'
  //     ]
  //   }
  // ];

  const handleOfficeClick = (office) => {
    setSelectedOffice(office);
    setShowOfficeModal(true);
  };

  const handleCloseModal = () => {
    setShowOfficeModal(false);
    setSelectedOffice(null);
  };

  const handleProceedToPayment = () => {
    // Navigate to payment flow
    navigate('/form');
    handleCloseModal();
  };

  const handleShare = (office) => {
    const message = `Check out this amazing office space at CoHopers!\n\n${office.title}\nPrice: ${office.price}\n\nFeatures:\n${office.features.join('\n')}\n\nVisit: https://co-hopers.vercel.app/services`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % privateOffices.length;
      const container = document.querySelector('.slider-container');
      const currentPage = container.children[prev];
      const nextPage = container.children[next];
      
      // Current page animation
      currentPage.style.transform = 'rotateY(-180deg)';
      currentPage.style.transformOrigin = 'right';
      currentPage.style.zIndex = '2';
      
      // Next page animation
      nextPage.style.transform = 'rotateY(0deg)';
      nextPage.style.transformOrigin = 'left';
      nextPage.style.zIndex = '1';
      
      // Reset after animation
      setTimeout(() => {
        currentPage.style.zIndex = '1';
        Array.from(container.children).forEach(child => {
          child.style.transform = '';
          child.style.transformOrigin = '';
        });
      }, 800);
      
      return next;
    });
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev - 1 + privateOffices.length) % privateOffices.length;
      const container = document.querySelector('.slider-container');
      const currentPage = container.children[prev];
      const prevPage = container.children[next];
      
      // Current page animation
      currentPage.style.transform = 'rotateY(180deg)';
      currentPage.style.transformOrigin = 'left';
      currentPage.style.zIndex = '2';
      
      // Previous page animation
      prevPage.style.transform = 'rotateY(0deg)';
      prevPage.style.transformOrigin = 'right';
      prevPage.style.zIndex = '1';
      
      // Reset after animation
      setTimeout(() => {
        currentPage.style.zIndex = '1';
        Array.from(container.children).forEach(child => {
          child.style.transform = '';
          child.style.transformOrigin = '';
        });
      }, 800);
      
      return next;
    });
  };

  const OfficeModal = () => (
    <Dialog 
      open={showOfficeModal}
      onClose={handleCloseModal}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          margin: { xs: 2, sm: 4 },
          maxWidth: { xs: '95%', sm: '900px' }
        }
      }}
    >
      <IconButton
        onClick={handleCloseModal}
                sx={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.8)',
          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
              >
        <CloseIcon sx={{ color: '#333', fontSize: 28 }} />
      </IconButton>
      {selectedOffice && (
        <>
          {/* Blue Section */}
            <Box sx={{ 
            bgcolor: '#9FE2DF',
            p: { xs: 3, sm: 4 },
              display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 4 }
          }}>
            {/* Left Section - Image */}
        <Box sx={{ 
              flex: 1,
          display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img 
                src={selectedOffice.image} 
                alt={selectedOffice.title}
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                  height: 'auto',
                  borderRadius: '12px',
                  objectFit: 'cover'
                  }} 
                />
              </Box>

            {/* Right Section - Content */}
        <Box sx={{ 
              flex: 1,
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between'
        }}>
              <Box>
          <Typography 
                  variant="h4" 
            component="h2" 
            sx={{ 
                    color: '#333',
              fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '24px', sm: '32px' }
            }}
          >
                  {selectedOffice.title}
          </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                    color: '#333',
                mb: 3,
                    fontSize: { xs: '16px', sm: '18px' },
                    lineHeight: 1.6
              }}
            >
                  {selectedOffice.description}
            </Typography>

                <List sx={{ mb: 3 }}>
                  {selectedOffice.features.map((feature, index) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    py: 0.5,
                    px: 0
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                        <CheckIcon sx={{ 
                          color: '#333',
                          fontSize: 20
                        }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#333',
                            fontSize: { xs: '14px', sm: '16px' },
                        fontWeight: 500
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
              </Box>

              {/* Share Button */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 2
              }}>
                <IconButton
                  onClick={() => handleShare(selectedOffice)}
                sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#333',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                    }
                }}
              >
                  <ShareIcon />
                </IconButton>
            </Box>
            </Box>
      </Box>

          {/* White Section - Price and Payment */}
      <Box sx={{ 
            bgcolor: 'white',
            p: { xs: 3, sm: 4 },
        display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 3 }
          }}>
            <Typography 
              variant="h5" 
              component="div"
              sx={{ 
                bgcolor: '#9FE2DF',
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                borderRadius: '8px',
                color: '#333',
                fontWeight: 'bold',
                fontSize: { xs: '18px', sm: '24px' },
                textAlign: 'center'
              }}
            >
              {selectedOffice.price} Per Month
            </Typography>

        <Button
          variant="contained"
              onClick={handleProceedToPayment}
          sx={{
            bgcolor: '#E53935',
            color: 'white',
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
            borderRadius: '8px',
                fontSize: { xs: '16px', sm: '18px' },
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#C62828'
            }
          }}
        >
          PROCEED TO PAYMENT
        </Button>
      </Box>
        </>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'white' }}>
      {/* Banner Slider Section */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '70vh', sm: '80vh', md: '90vh' },
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}>
        {/* Navigation Buttons */}
        <IconButton
          onClick={handlePrevSlide}
          sx={{ 
            position: 'absolute',
            left: { xs: 10, sm: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            },
            width: { xs: 40, sm: 50 },
            height: { xs: 40, sm: 50 }
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
        </IconButton>

        <IconButton
          onClick={handleNextSlide}
          sx={{ 
            position: 'absolute',
            right: { xs: 10, sm: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            },
            width: { xs: 40, sm: 50 },
            height: { xs: 40, sm: 50 }
          }}
        >
          <ChevronRightIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
        </IconButton>

        {/* Slides Container with Page Turn Animation */}
        <Box 
          className="slider-container"
          sx={{ 
            display: 'flex',
            width: `${privateOffices.length * 100}%`,
            height: '100%',
            transform: `translateX(-${(currentSlide * 100) / privateOffices.length}%)`,
            transition: 'all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: '2000px'
          }}
        >
          {privateOffices.map((office, index) => (
            <Box
              key={office.id}
              sx={{
                width: `${100 / privateOffices.length}%`,
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
                backfaceVisibility: 'hidden',
                transformOrigin: index > currentSlide ? 'left' : 'right',
                transition: 'all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
                transform: index === currentSlide 
                  ? 'rotateY(0deg)' 
                  : index < currentSlide 
                    ? 'rotateY(-180deg)' 
                    : 'rotateY(0deg)',
                boxShadow: index === currentSlide 
                  ? '0 4px 8px rgba(0,0,0,0.1)' 
                  : 'none',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '40px',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)',
                  left: 0,
                  opacity: index === currentSlide ? 1 : 0
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '40px',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)',
                  right: 0,
                  opacity: index === currentSlide ? 1 : 0
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleOfficeClick(office);
              }}
            >
              {/* Background Image */}
              <Box
                component="img"
                src={privateOfficeJpg}
                alt="office background"
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              />
              {/* Dark Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1
                }}
              />
              {/* Content */}
              <Box sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 3, sm: 4 }
              }}>
                {/* Availability Label */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    marginLeft: { xs: '5%', sm: '4%', md: '2%' },
                    bgcolor: office.isAvailable ? '#4CAF50' : '#f44336',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: '0 20px 20px 0',
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transform: 'translateX(-5px)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(0)',
                    },
                    zIndex: 3
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      animation: office.isAvailable ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                  {office.isAvailable ? 'Available' : 'Already Booked'}
                </Box>

                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ 
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '28px', sm: '36px', md: '48px' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    mb: 2
                  }}
                >
                  {office.title}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ 
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      fontSize: { xs: '24px', sm: '32px', md: '40px' },
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                    }}
                  >
                    {office.price}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOfficeClick(office);
                    }}
                    sx={{
                      background: 'linear-gradient(45deg, #00e5ff, #2196f3)',
                      color: 'white',
                      px: { xs: 4, sm: 6 },
                      py: { xs: 1, sm: 1.5 },
                      borderRadius: '50px',
                      fontSize: { xs: '16px', sm: '20px' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2196f3, #00e5ff)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px rgba(0,0,0,0.3)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Office Modal */}
      <OfficeModal />
    </Box>
  );
};

export default Services; 