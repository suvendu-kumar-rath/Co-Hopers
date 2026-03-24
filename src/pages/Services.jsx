import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, useTheme, useMediaQuery, IconButton, CircularProgress } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { PRIVATE_OFFICES } from '../constants/officeData';
import { ROUTES } from '../constants/routes';
import { shareToWhatsApp } from '../utils/helpers/shareUtils';
import { getSpaceImageUrl } from '../utils/helpers/imageUtils';
import { spacesService } from '../services';
import { useAuth } from '../context/AuthContext';
import { ENV_CONFIG } from '../config/environment';
import LoginModal from '../components/modals/LoginModal';

const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
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
  
  // State for tracking current image index for each space (for multi-image carousel)
  const [spaceImageIndexes, setSpaceImageIndexes] = useState({});
  
  // State for modal image carousel
  const [modalImageIndex, setModalImageIndex] = useState(0);

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
  
  // Booking ID state
  const [currentBookingId, setCurrentBookingId] = useState(null);

  // Trigger the same auth modal flow used by "Book Now" when requested from navbar.
  useEffect(() => {
    if (location.state?.openBookNowAuth) {
      setShowOfficeModal(false);
      setShowPaymentModal(false);
      setSelectedOffice(null);
      setShowLoginModal(true);

      // Clear one-time state to avoid reopening modal on refresh/back navigation.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

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

  // Helper function to get all images for a space
  const getSpaceImages = (space) => {
    if (!space) return [];
    
    let imagesArray = [];
    
    // Parse images if it's a JSON string
    if (typeof space.images === 'string') {
      try {
        imagesArray = JSON.parse(space.images);
      } catch (e) {
        // If parsing fails, check if it's a single image
        if (space.image) {
          imagesArray = [space.image];
        }
      }
    } else if (Array.isArray(space.images)) {
      imagesArray = space.images;
    } else if (space.image) {
      imagesArray = [space.image];
    }
    
    // Filter out any invalid entries and unwrap nested arrays
    return imagesArray
      .map(img => {
        // Unwrap nested arrays
        while (Array.isArray(img) && img.length > 0) {
          img = img[0];
        }
        return img;
      })
      .filter(img => typeof img === 'string' && img.trim());
  };

  // Auto-rotate images for each space (inner carousel)
  useEffect(() => {
    // Pause background carousel while any modal is open to avoid flicker behind overlays.
    if (showLoginModal || showOfficeModal || showPaymentModal) {
      return;
    }

    const interval = setInterval(() => {
      setSpaceImageIndexes(prev => {
        const newIndexes = { ...prev };
        
        privateOffices.forEach(office => {
          const images = getSpaceImages(office);
          if (images.length > 1) {
            const currentIndex = newIndexes[office.id] || 0;
            newIndexes[office.id] = (currentIndex + 1) % images.length;
          }
        });
        
        return newIndexes;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [privateOffices, showLoginModal, showOfficeModal, showPaymentModal]);

  
  // Fetch space details from API when Book Now is clicked
  const handleOfficeClick = async (office) => {
    // Reset modal image index when opening a new space
    setModalImageIndex(0);
    
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
    setModalImageIndex(0); // Reset modal image index when closing
  };

  const handleProceedToPayment = async () => {
    console.log('handleProceedToPayment called - isAuthenticated:', isAuthenticated);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Close office modal first, then show login/register modal
      setShowOfficeModal(false);
      setShowLoginModal(true);
      return;
    }
    
    // User is authenticated (KYC already approved), open payment modal
    // Booking will be created when user proceeds in the payment modal
    console.log('User authenticated, opening payment modal...');
    setShowOfficeModal(false);
    setShowPaymentModal(true);
    setPaymentStep(0);
    setPaymentMethod('scan');
  };

  const handleShare = (office) => {
    shareToWhatsApp(office);
  };

  // Login/Register modal handlers
  const handleLoginSuccess = async (userData) => {
    console.log('Login successful:', userData);
    setShowLoginModal(false);
    
    // After login, user can now proceed to book
    // Booking will only be created when payment modal opens and user confirms
    console.log('User logged in, KYC already approved, user can now click Book Now to proceed');
    
    // Simply re-open the office modal so user can click "Book Now" to proceed to payment
    if (selectedOffice) {
      setShowOfficeModal(true);
    }
  };
  
  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful:', userData);
    setShowLoginModal(false);
    
    // After registration, navigate to KYC form
    // Do NOT pass space ID - KYC is independent of space selection
    console.log('Redirecting new user to KYC form');
    navigate(ROUTES.FORM, {
      state: {
        fromRegistration: true,
        userId: userData?.id || userData?.user?.id
      }
    });
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    // Re-open office modal if user cancels login
    if (selectedOffice) {
      setShowOfficeModal(true);
    }
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
    console.log('Selected office:', selectedOffice);
    
    // Create booking only when user proceeds to payment (first click of Next button)
    if (!currentBookingId && selectedOffice) {
      console.log('No booking ID found, creating booking now with space ID:', selectedOffice.id);
      console.log('Selected office full object:', selectedOffice);
      
      try {
        // Parse amount from selectedOffice - check multiple possible field names
        let amount = 1500; // default fallback
        
        // Try different possible price field names from API
        const priceValue = selectedOffice?.price || 
                          selectedOffice?.finalPrice || 
                          selectedOffice?.monthlyPrice || 
                          selectedOffice?.amount ||
                          selectedOffice?.monthly_price;
        
        console.log('Price value found:', priceValue, 'type:', typeof priceValue);
        
        if (priceValue) {
          // If it's already a number, use it directly
          if (typeof priceValue === 'number') {
            amount = priceValue;
          } 
          // If it's a string, parse it
          else if (typeof priceValue === 'string') {
            // Remove currency symbols, commas, and 'k' notation, then extract numbers
            let cleanPrice = priceValue.replace(/[₹$,+\sGST]/gi, '').trim();
            
            // Handle 'k' notation (e.g., "16k" = 16000)
            if (cleanPrice.toLowerCase().includes('k')) {
              const numMatch = cleanPrice.match(/[\d.]+/);
              if (numMatch) {
                const parsedAmount = parseFloat(numMatch[0]) * 1000;
                if (!isNaN(parsedAmount) && parsedAmount > 0) {
                  amount = parsedAmount;
                }
              }
            } else {
              // Regular number parsing
              const numMatch = cleanPrice.match(/[\d.]+/);
              if (numMatch) {
                const parsedAmount = parseFloat(numMatch[0]);
                if (!isNaN(parsedAmount) && parsedAmount > 0) {
                  amount = parsedAmount;
                }
              }
            }
          }
        }
        
        console.log('Final parsed amount:', amount, 'from price:', priceValue);
        
        const bookingData = {
          spaceId: selectedOffice?.id || 1,
          date: new Date().toISOString().split('T')[0],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: amount
        };

        // Validate booking data before sending
        if (!bookingData.spaceId || !bookingData.date || !bookingData.startDate || !bookingData.endDate || !bookingData.amount) {
          console.error('Invalid booking data - missing required fields:', bookingData);
          alert('Invalid booking data. Please try again.');
          return;
        }

        console.log('Creating booking with data:', bookingData);
        
        const { bookingService } = await import('../services');
        const bookingResult = await bookingService.bookSpace(bookingData);
        
        if (bookingResult.success) {
          console.log('Booking created successfully:', bookingResult.data);
          const bookingId = bookingResult.data?.booking?.id || bookingResult.data?.id;
          setCurrentBookingId(bookingId);
          
          // Now navigate to payment upload page with the booking ID
          console.log('Navigating to payment upload page with booking ID:', bookingId);
          navigate(ROUTES.PAYMENT_UPLOAD, {
            state: {
              bookingId: bookingId,
              officeData: selectedOffice,
              paymentMethod: paymentMethod
            }
          });
          
          // Close payment modal
          setShowPaymentModal(false);
        } else {
          console.error('Booking creation failed:', bookingResult.message);
          alert(`Booking creation failed: ${bookingResult.message}`);
          return;
        }
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again.');
        return;
      }
    } else if (currentBookingId) {
      // Booking already exists, just navigate
      console.log('Booking already exists, navigating to payment upload page...');
      navigate(ROUTES.PAYMENT_UPLOAD, {
        state: {
          bookingId: currentBookingId,
          officeData: selectedOffice,
          paymentMethod: paymentMethod
        }
      });
      
      // Close payment modal
      setShowPaymentModal(false);
    } else {
      console.error('No selected office found. Cannot create booking.');
      alert('Please select a space before proceeding to payment.');
    }
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % privateOffices.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + privateOffices.length) % privateOffices.length);
  };

  const OfficeModal = () => (
    <Dialog 
      open={showOfficeModal}
      onClose={handleCloseModal}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          margin: { xs: 1, sm: 2, md: 4 },
          maxWidth: { xs: '95%', sm: '900px' },
          maxHeight: { xs: '95vh', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <IconButton
        onClick={handleCloseModal}
                sx={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1001,
          bgcolor: 'rgba(255,255,255,0.8)',
          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
              >
        <CloseIcon sx={{ color: '#333', fontSize: 28 }} />
      </IconButton>
      {selectedOffice && (
        <>
          <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {/* Blue Section */}
            <Box sx={{ 
            bgcolor: '#9FE2DF',
            p: { xs: 3, sm: 4 },
              display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 4 }
          }}>
            {/* Left Section - Image Carousel */}
        <Box sx={{ 
              flex: 1,
          display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '12px',
              minHeight: '250px',
              position: 'relative',
              bgcolor: '#f0f0f0',
              overflow: 'hidden'
            }}>
              {(() => {
                const images = getSpaceImages(selectedOffice);
                
                if (images.length === 0) {
                  return (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      p: 3
                    }}>
                      <CameraAltIcon sx={{ fontSize: 60, mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">Image not available</Typography>
                    </Box>
                  );
                }
                
                return (
                  <>
                    {/* Images */}
                    {images.map((image, imgIndex) => {
                      const imageUrl = typeof image === 'string' && image.trim() 
                        ? (image.startsWith('http') ? image : `${ENV_CONFIG.API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://api.boldtribe.in'}/${image.startsWith('/') ? image.slice(1) : image}`)
                        : null;
                      
                      return imageUrl ? (
                        <Box
                          key={imgIndex}
                          component="img"
                          src={imageUrl}
                          alt={`${selectedOffice.title} - Image ${imgIndex + 1}`}
                          onError={(e) => {
                            console.error('[Services] Modal image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                          sx={{
                            position: 'absolute',
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            minHeight: '250px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            opacity: imgIndex === modalImageIndex ? 1 : 0,
                            transition: 'opacity 0.5s ease-in-out',
                            zIndex: imgIndex === modalImageIndex ? 1 : 0
                          }}
                        />
                      ) : null;
                    })}
                    
                    {/* Navigation Arrows for Modal Images */}
                    {images.length > 1 && (
                      <>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                          }}
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            zIndex: 2,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                            width: 32,
                            height: 32
                          }}
                        >
                          <ChevronLeftIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex(prev => (prev + 1) % images.length);
                          }}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            zIndex: 2,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                            width: 32,
                            height: 32
                          }}
                        >
                          <ChevronRightIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        
                        {/* Image Counter */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          zIndex: 2
                        }}>
                          {modalImageIndex + 1} / {images.length}
                        </Box>
                      </>
                    )}
                  </>
                );
              })()}
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
          </DialogContent>
          
          {/* White Section - Price and Payment - Fixed at bottom */}
      <Box sx={{ 
            bgcolor: 'white',
            p: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 3 },
            flexShrink: 0,
            borderTop: '1px solid #e0e0e0',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
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
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                textAlign: 'center',
                flexShrink: 0
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
                py: { xs: 1.25, sm: 1.5 },
            borderRadius: '8px',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            fontWeight: 'bold',
                minHeight: { xs: '44px', sm: '48px' },
                whiteSpace: 'nowrap',
                flexShrink: 0,
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
    <Box sx={{ width: '100%', bgcolor: 'white' }}>
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
        height: 'calc(100vh - 84px)',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}>
        {/* Navigation Buttons */}
        <IconButton
          onClick={handlePrevSlide}
          sx={{ 
            position: 'absolute',
            left: { xs: 5, sm: 10, md: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            },
            width: { xs: 36, sm: 45, md: 50 },
            height: { xs: 36, sm: 45, md: 50 },
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: 20, sm: 28, md: 30 } }} />
        </IconButton>

        <IconButton
          onClick={handleNextSlide}
          sx={{ 
            position: 'absolute',
            right: { xs: 5, sm: 10, md: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            },
            width: { xs: 36, sm: 45, md: 50 },
            height: { xs: 36, sm: 45, md: 50 },
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ChevronRightIcon sx={{ fontSize: { xs: 20, sm: 28, md: 30 } }} />
        </IconButton>

        {/* Slides Container */}
        <Box 
          className="slider-container"
          sx={{ 
            display: 'flex',
            width: '100%',
            height: '100%',
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.6s ease-in-out',
            position: 'relative',
          }}
        >
          {privateOffices.map((office, index) => (
            <Box
              key={office.id}
              sx={{
                minWidth: '100vw',
                width: '100vw',
                height: '100%',
                flexShrink: 0,
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleOfficeClick(office);
              }}
            >
              {/* Background Image Carousel (Multiple Images) */}
              {(() => {
                const images = getSpaceImages(office);
                const currentImageIndex = spaceImageIndexes[office.id] || 0;
                
                if (images.length === 0) {
                  // No images available
                  return (
                    <Box sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      bgcolor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 0
                    }}>
                      <CameraAltIcon sx={{ fontSize: 80, opacity: 0.2, color: 'white' }} />
                    </Box>
                  );
                }
                
                // Single Image - Display statically without carousel effects
                if (images.length === 1) {
                  const imageUrl = typeof images[0] === 'string' && images[0].trim() 
                    ? (images[0].startsWith('http') ? images[0] : `${ENV_CONFIG.API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://api.boldtribe.in'}/${images[0].startsWith('/') ? images[0].slice(1) : images[0]}`)
                    : null;
                  
                  return imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={office.space_name || office.title}
                      onError={(e) => {
                        console.error('[Services] Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                  ) : null;
                }
                
                // Multiple Images - Show carousel with transitions and indicators
                return (
                  <>
                    {/* Image Container with Crossfade Effect */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100%',
                      zIndex: 0
                    }}>
                      {images.map((image, imgIndex) => {
                        const imageUrl = typeof image === 'string' && image.trim() 
                          ? (image.startsWith('http') ? image : `${ENV_CONFIG.API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://api.boldtribe.in'}/${image.startsWith('/') ? image.slice(1) : image}`)
                          : null;
                        
                        return imageUrl ? (
                          <Box
                            key={imgIndex}
                            component="img"
                            src={imageUrl}
                            alt={`${office.space_name || office.title} - Image ${imgIndex + 1}`}
                            onError={(e) => {
                              console.error('[Services] Multi-image failed to load:', e.target.src);
                              e.target.style.display = 'none';
                            }}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100vw',
                              height: '100%',
                              objectFit: 'cover',
                              opacity: imgIndex === currentImageIndex ? 1 : 0,
                              transition: 'opacity 1s ease-in-out',
                              zIndex: imgIndex === currentImageIndex ? 1 : 0
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                    
                  </>
                );
              })()}
              
              {/* Dark Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1
                }}
              />
              {/* Content */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100%',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 3, sm: 4 },
                pb: { xs: 5, sm: 6, md: 7 }
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
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    mb: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 0 }
                  }}
                >
                  {office.space_name || office.title || office.spaceName || 'Workspace'}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  mb: { xs: 2, sm: 3, md: 4 }
                }}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ 
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' },
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
                      px: { xs: 3, sm: 5, md: 6 },
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      borderRadius: '50px',
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                      minWidth: { xs: '120px', sm: '140px' },
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