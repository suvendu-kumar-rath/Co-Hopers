import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Paper, Fade, Input, Divider, TextField, InputAdornment, useTheme, useMediaQuery, IconButton, Stepper, Step, StepLabel, Avatar, CircularProgress } from '@mui/material';
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
import directorKYCImage from '../assets/images/KYC.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KYCImage from '../assets/images/KYC.png';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { PRIVATE_OFFICES } from '../constants/officeData';
import { ROUTES } from '../constants/routes';
import { shareToWhatsApp } from '../utils/helpers/shareUtils';
import PaymentModal from '../components/modals/PaymentModal';
import { spacesService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/modals/LoginModal';

const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();
  const { officeType, id } = useParams();
  const { isAuthenticated, user } = useAuth();

  // Static features that will be shown for all spaces
  const staticFeatures = [
    'High-speed WiFi',
    'Professional environment',
    'Meeting rooms access',
    'Reception services',
    '24/7 Security',
    'Air conditioning',
    'Parking available',
    'Tea/Coffee facilities'
  ];

  // State for popup modal and slider
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: payment options
  const [paymentMethod, setPaymentMethod] = useState('scan'); // 'scan' or 'account'

  // Debug payment step changes
  useEffect(() => {
    console.log('Payment step changed to:', paymentStep);
  }, [paymentStep]);

  useEffect(() => {
    console.log('Payment modal visibility changed to:', showPaymentModal);
  }, [showPaymentModal]);

  // Spaces data from API
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  
  // KYC tracking
  const [kycSubmitted, setKycSubmitted] = useState(false);
  
  // Booking ID state
  const [currentBookingId, setCurrentBookingId] = useState(null);

  // Use API data if available, otherwise fallback to static data
  const privateOffices = spaces.length > 0 ? spaces : PRIVATE_OFFICES;

  // Fetch spaces data from API on component mount
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching spaces from API...');
        const response = await spacesService.getSpaces();
        
        console.log('Spaces API Response:', response);
        
        // Check if response has the expected structure
        if (response && response.success && response.data) {
          // Transform API data to match UI expectations
          const transformedSpaces = response.data.map(space => ({
            ...space,
            // Map availability fields - check multiple possible field names
            isAvailable: space.isAvailable !== undefined 
              ? space.isAvailable 
              : (space.availability === 'Available' || space.isActive === true),
            // Ensure other required fields are present
            title: space.title || space.space_name || space.spaceName,
            price: space.price || space.finalPrice || '₹0'
          }));
          setSpaces(transformedSpaces);
          console.log('Transformed spaces data:', transformedSpaces);
        } else if (response && Array.isArray(response)) {
          // If response is directly an array of spaces
          const transformedSpaces = response.map(space => ({
            ...space,
            isAvailable: space.isAvailable !== undefined 
              ? space.isAvailable 
              : (space.availability === 'Available' || space.isActive === true),
            title: space.title || space.space_name || space.spaceName,
            price: space.price || space.finalPrice || '₹0'
          }));
          setSpaces(transformedSpaces);
          console.log('Transformed spaces data (direct array):', transformedSpaces);
        } else {
          console.warn('Unexpected API response structure:', response);
          // Keep using fallback static data
          setSpaces([]);
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
        setError(error.message);
        // Keep using fallback static data on error
        setSpaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  
  // Fetch space details from API when Book Now is clicked
  const handleOfficeClick = async (office) => {
    // If office has an id, fetch details from API
    if (office && office.id) {
      try {
        const result = await spacesService.getSpaceById(office.id);
        if (result.success) {
          setSelectedOffice({ ...office, ...result.data });
        } else {
          setSelectedOffice(office);
          // Optionally show error message to user
          console.error('Failed to fetch space details:', result.message);
        }
      } catch (error) {
        setSelectedOffice(office);
        console.error('Error fetching space details:', error);
      }
    } else {
      setSelectedOffice(office);
    }
    setShowOfficeModal(true);
  };

  const handleCloseModal = () => {
    setShowOfficeModal(false);
    setSelectedOffice(null);
  };

  const handleProceedToPayment = async () => {
    console.log('handleProceedToPayment called - isAuthenticated:', isAuthenticated);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Close office modal first, then show login/register modal
      setShowOfficeModal(false);
      setShowLoginModal(true);
      setIsRegistrationMode(false); // Allow both login and register
      return;
    }
    
    // User is authenticated (KYC already approved), create booking first
    console.log('User authenticated, creating booking...');
    
    try {
      const bookingData = {
        spaceId: selectedOffice?.id || 1,
        date: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: parseFloat(selectedOffice?.price?.replace(/[^\d.]/g, '') || '1500')
      };

      console.log('Creating booking with data:', bookingData);
      
      const { bookingService } = await import('../services');
      const bookingResult = await bookingService.bookSpace(bookingData);
      
      if (bookingResult.success) {
        console.log('Booking created successfully:', bookingResult.data);
        const bookingId = bookingResult.data?.booking?.id || bookingResult.data?.id;
        setCurrentBookingId(bookingId);
        
        // After successful booking creation, show payment modal
        setShowOfficeModal(false);
        setShowPaymentModal(true);
        setPaymentStep(0);
        setPaymentMethod('scan');
      } else {
        console.error('Booking creation failed:', bookingResult.message);
        alert(`Booking creation failed: ${bookingResult.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleShare = (office) => {
    shareToWhatsApp(office);
  };

  // Login/Register modal handlers
  const handleLoginSuccess = async (userData) => {
    console.log('Login successful:', userData);
    setShowLoginModal(false);
    
    // Check if user has KYC approved (you can check userData.kycRequired or similar)
    // For now, assume if logging in, KYC is already approved
    console.log('User logged in, KYC already approved, creating booking...');
    
    // Create booking immediately after login
    try {
      const bookingData = {
        spaceId: selectedOffice?.id || 1,
        date: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: parseFloat(selectedOffice?.price?.replace(/[^\d.]/g, '') || '1500')
      };

      console.log('Creating booking with data:', bookingData);
      
      const { bookingService } = await import('../services');
      const bookingResult = await bookingService.bookSpace(bookingData);
      
      if (bookingResult.success) {
        console.log('Booking created successfully:', bookingResult.data);
        const bookingId = bookingResult.data?.booking?.id || bookingResult.data?.id;
        setCurrentBookingId(bookingId);
        
        // After successful booking creation, show payment modal
        setShowPaymentModal(true);
        setPaymentStep(0);
        setPaymentMethod('scan');
      } else {
        console.error('Booking creation failed:', bookingResult.message);
        alert(`Booking creation failed: ${bookingResult.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };
  
  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful:', userData);
    setShowLoginModal(false);
    
    // After registration, navigate to KYC form
    console.log('Redirecting new user to KYC form');
    navigate(ROUTES.FORM, {
      state: {
        selectedOffice: selectedOffice,
        fromRegistration: true,
        userId: userData?.id || userData?.user?.id
      }
    });
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    // Re-open office modal if user cancels login
    setShowOfficeModal(true);
  };

  // Payment modal handlers
  const handleClosePaymentModal = () => {
    console.log('Closing payment modal and resetting state');
    setShowPaymentModal(false);
    setPaymentStep(0);
    setPaymentMethod('scan');
    setSelectedOffice(null);
    setCurrentBookingId(null); // Clear booking ID when payment modal closes
  };

  const handleNextPaymentStep = async () => {
    console.log('=== handleNextPaymentStep DEBUG ===');
    console.log('Current paymentStep:', paymentStep);
    console.log('showPaymentModal:', showPaymentModal);
    console.log('Current booking ID:', currentBookingId);
    console.log('Payment method:', paymentMethod);
    
    // Check if booking ID exists
    if (!currentBookingId) {
      console.error('Booking ID not found. currentBookingId:', currentBookingId);
      alert('Booking ID not found. Please try booking again from the office selection.');
      return;
    }
    
    console.log('Navigating to payment upload page...');
    
    // Navigate to payment upload page with booking data
    navigate(ROUTES.PAYMENT_UPLOAD, {
      state: {
        bookingId: currentBookingId,
        officeData: selectedOffice,
        paymentMethod: paymentMethod
      }
    });
    
    // Close payment modal
    setShowPaymentModal(false);
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
                  {staticFeatures.map((feature, index) => (
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
          {isAuthenticated ? 'PROCEED TO PAYMENT' : 'LOGIN & PROCEED'}
        </Button>
      </Box>
        </>
      )}
    </Dialog>
  );

  // Payment Modal Component
  const PaymentModal = () => (
    <Dialog 
      open={showPaymentModal}
      onClose={handleClosePaymentModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          margin: { xs: 2, sm: 4 },
          maxWidth: { xs: '95%', sm: '700px' }
        }
      }}
    >
      <IconButton
        onClick={handleClosePaymentModal}
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

      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #9FE2DF 0%, #7dd3d8 100%)',
        p: { xs: 3, sm: 4 },
        textAlign: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
        }
      }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ 
            color: '#333',
            fontWeight: 'bold',
            fontSize: { xs: '28px', sm: '32px' },
            textShadow: '0 2px 4px rgba(255,255,255,0.3)',
            mb: 1
          }}
        >
          Complete Payment
        </Typography>
        
        {/* Step Indicator */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          mb: 2,
          alignItems: 'center'
        }}>
          <Box sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: '#E53935',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>1</Box>
        </Box>
        
        <Typography variant="body2" sx={{ 
          color: '#333', 
          textAlign: 'center',
          mb: 1,
          fontWeight: 500
        }}>
          Choose Payment Method
        </Typography>
        {selectedOffice && (
          <Box sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            p: 2,
            mt: 2,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#333',
                fontSize: { xs: '18px', sm: '22px' },
                fontWeight: '600'
              }}
            >
              {selectedOffice.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2c5530',
                mt: 0.5,
                fontSize: { xs: '16px', sm: '18px' },
                fontWeight: 'bold'
              }}
            >
              {selectedOffice.price} Per Month
            </Typography>
          </Box>
        )}
      </Box>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          p: 2, 
          bgcolor: '#f0f0f0', 
          borderBottom: '1px solid #ddd',
          fontSize: '12px'
        }}>
          <strong>DEBUG:</strong> 
          paymentStep={paymentStep}, 
          showPaymentModal={showPaymentModal ? 'YES' : 'NO'}
        </Box>
      )}

      {/* Step Content */}
      <DialogContent sx={{ p: 0 }}>
        {paymentStep === 0 && (
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#333' }}>
              Choose Payment Method
            </Typography>
            
            {/* Two Column Layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, md: 3 },
              minHeight: 'auto'
            }}>
              {/* Left Side - Payment Options */}
              <Box sx={{ 
                flex: { xs: 1, md: '0 0 30%' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {/* Scan and Pay Option */}
                  <FormControlLabel
                    value="scan"
                    control={<Radio sx={{ color: '#9FE2DF', display: 'none' }} />}
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        width: '100%',
                        p: 2.5,
                        border: paymentMethod === 'scan' ? '2px solid #9FE2DF' : '2px solid #e0e0e0',
                        borderRadius: '16px',
                        bgcolor: paymentMethod === 'scan' ? 'rgba(159, 226, 223, 0.15)' : 'white',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: paymentMethod === 'scan' ? '0 4px 12px rgba(159, 226, 223, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        '&:hover': {
                          borderColor: '#9FE2DF',
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(159, 226, 223, 0.4)'
                        }
                      }}>
                        <QrCodeIcon sx={{ 
                          color: paymentMethod === 'scan' ? '#9FE2DF' : '#666', 
                          fontSize: 28,
                          transition: 'color 0.3s ease' 
                        }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: paymentMethod === 'scan' ? 600 : 500,
                          color: paymentMethod === 'scan' ? '#333' : '#666',
                          fontSize: '16px'
                        }}>
                          Scan and Pay
                        </Typography>
                        {paymentMethod === 'scan' && (
                          <CheckCircleIcon sx={{ 
                            color: '#9FE2DF', 
                            fontSize: 20, 
                            ml: 'auto' 
                          }} />
                        )}
                      </Box>
                    }
                    sx={{ 
                      margin: 0,
                      width: '100%',
                      mb: 1.5
                    }}
                  />

                  {/* Account Details Option */}
                  <FormControlLabel
                    value="account"
                    control={<Radio sx={{ color: '#9FE2DF', display: 'none' }} />}
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        width: '100%',
                        p: 2.5,
                        border: paymentMethod === 'account' ? '2px solid #9FE2DF' : '2px solid #e0e0e0',
                        borderRadius: '16px',
                        bgcolor: paymentMethod === 'account' ? 'rgba(159, 226, 223, 0.15)' : 'white',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: paymentMethod === 'account' ? '0 4px 12px rgba(159, 226, 223, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        '&:hover': {
                          borderColor: '#9FE2DF',
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(159, 226, 223, 0.4)'
                        }
                      }}>
                        <AccountBalanceIcon sx={{ 
                          color: paymentMethod === 'account' ? '#9FE2DF' : '#666', 
                          fontSize: 28,
                          transition: 'color 0.3s ease' 
                        }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: paymentMethod === 'account' ? 600 : 500,
                          color: paymentMethod === 'account' ? '#333' : '#666',
                          fontSize: '16px'
                        }}>
                          Account Details
                        </Typography>
                        {paymentMethod === 'account' && (
                          <CheckCircleIcon sx={{ 
                            color: '#9FE2DF', 
                            fontSize: 20, 
                            ml: 'auto' 
                          }} />
                        )}
                      </Box>
                    }
                    sx={{ 
                      margin: 0,
                      width: '100%'
                    }}
                  />
                </RadioGroup>
              </Box>

              {/* Right Side - Payment Method Content */}
              <Box sx={{ 
                flex: { xs: 1, md: '0 0 70%' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, sm: 4 },
                minHeight: { xs: '320px', md: '380px' },
                overflow: 'auto'
              }}>
                {paymentMethod === 'scan' && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -2 }}>
                    {/* QR Code Label */}
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#333', fontWeight: 600, letterSpacing: 1 }}>
                      Scan this QR code to pay
                    </Typography>
                    {/* QR Code Section */}
                    <Box sx={{
                      bgcolor: '#fff',
                      p: { xs: 2, sm: 3 },
                      borderRadius: '16px',
                      mb: 2,
                      boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
                      border: '2px solid #9FE2DF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      maxWidth: 260,
                      width: '100%'
                    }}>
                      <img
                        src="/WhatsApp Image 2025-10-13 at 5.04.52 PM.jpeg"
                        alt="Payment QR Code"
                        style={{
                          width: '220px',
                          height: '220px',
                          objectFit: 'contain',
                          borderRadius: '12px',
                          border: '1.5px solid #e0e0e0',
                          background: '#f8f9fa',
                          marginBottom: 8
                        }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      {/* Fallback QR Icon (hidden by default) */}
                      <QrCodeIcon sx={{
                        fontSize: 80,
                        color: '#bbb',
                        mb: 1,
                        display: 'none'
                      }} />
                    </Box>
                    {/* UPI Details */}
                    <Box sx={{
                      bgcolor: 'rgba(159, 226, 223, 0.13)',
                      p: 2,
                      borderRadius: '12px',
                      border: '1.5px solid #9FE2DF',
                      width: '100%',
                      maxWidth: 320,
                      textAlign: 'center',
                      mt: 1
                    }}>
                      <Typography variant="h6" sx={{
                        mb: 1,
                        color: '#2c5530',
                        fontSize: { xs: '15px', sm: '17px' },
                        fontWeight: 'bold',
                        letterSpacing: 0.5
                      }}>
                        UPI ID: <span style={{ color: '#E53935', fontWeight: 700 }}>siva.beb-3@oksbi</span>
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#666',
                        fontSize: { xs: '12px', sm: '14px' }
                      }}>
                        You can also copy the UPI ID to pay directly in your UPI app.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {paymentMethod === 'account' && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -24 }}>
                    <Typography variant="h6" sx={{
                      mb: 1,
                      color: '#333',
                      textAlign: 'center',
                      fontSize: { xs: '18px', sm: '20px' },
                      fontWeight: 'bold'
                    }}>
                      Bank Account Details
                    </Typography>
                    <Box sx={{
                      width: '100%',
                      maxWidth: '380px',
                      bgcolor: '#f8f9fa',
                      borderRadius: '16px',
                      p: { xs: 2, sm: 3 },
                      border: '2px solid #9FE2DF',
                      boxShadow: '0 4px 16px rgba(159,226,223,0.10)',
                      mb: 2
                    }}>
                      {/* Bank Icon */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <AccountBalanceIcon sx={{
                          fontSize: { xs: 32, sm: 40 },
                          color: '#9FE2DF'
                        }} />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            Account Name:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: { xs: '14px', sm: '15px' } }}>
                            9C Technology Labs Private Limited
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            Current A/C No:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: { xs: '14px', sm: '15px' }, letterSpacing: '1px' }}>
                            50200045207337
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            IFSC Code:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: { xs: '13px', sm: '14px' } }}>
                            HDFC0004013
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            Bank Name:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: { xs: '13px', sm: '14px' } }}>
                            HDFC Bank
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            Branch:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: { xs: '13px', sm: '14px' } }}>
                            Infocity, Bhubaneswar, Plot E/3, Ground floor, Chandaka industrial estate, Patia
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5, fontSize: { xs: '12px', sm: '13px' } }}>
                            UPI ID:
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#E53935', fontWeight: 700, fontSize: { xs: '14px', sm: '15px' } }}>
                            siva.beb-3@okhdfcbank
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}


      </DialogContent>

      {/* Footer Buttons */}
      <DialogActions sx={{ 
        p: { xs: 3, sm: 4 },
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        justifyContent: 'space-between',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Button
          onClick={handleClosePaymentModal}
          sx={{
            color: '#666',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            fontSize: '16px',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'rgba(102, 102, 102, 0.1)',
              color: '#333'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleNextPaymentStep}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
            color: 'white',
            px: { xs: 3, sm: 5 },
            py: 1.5,
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
              boxShadow: '0 6px 16px rgba(229, 57, 53, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Proceed to Payment Upload
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Show loading state while fetching data
  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        bgcolor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#2196f3' }} />
        <Typography variant="h6" sx={{ color: '#666' }}>
          Loading spaces...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'white' }}>
      {/* Show error message if API fails but still show fallback data */}
      {error && (
        <Box sx={{ 
          bgcolor: '#fff3cd', 
          color: '#856404', 
          p: 2, 
          textAlign: 'center',
          borderBottom: '1px solid #ffeaa7'
        }}>
          <Typography variant="body2">
            Unable to load latest spaces data. Showing default spaces. ({error})
          </Typography>
        </Box>
      )}
      
      {/* User Authentication Status */}
      {isAuthenticated && user && (
        <Box sx={{ 
          bgcolor: '#e8f5e9', 
          color: '#2e7d32', 
          p: 1, 
          textAlign: 'center',
          borderBottom: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}>
          <CheckIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            Welcome back, {user.name || user.mobileNumber || 'User'}!
          </Typography>
        </Box>
      )}
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
                  {office.isAvailable ? 'Available' : 'Not Available'}
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
                  {office.space_name}
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

      {/* Payment Modal */}
      <PaymentModal />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={handleLoginClose}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        allowRegister={true}
      />
    </Box>
  );
};

export default Services; 