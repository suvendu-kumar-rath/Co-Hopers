import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { bookingService } from '../services';
import { ROUTES } from '../constants/routes';

const PaymentUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId, officeData, paymentMethod } = location.state || {};

  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect back if no booking data
    if (!bookingId || !officeData) {
      console.error('Missing booking data, redirecting to services');
      navigate(ROUTES.SERVICES);
    }
  }, [bookingId, officeData, navigate]);

  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setUploadedScreenshot(file);
      setError(null);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    console.log('=== Payment Upload Page - Submit Payment ===');
    console.log('Booking ID:', bookingId);
    console.log('Uploaded screenshot:', uploadedScreenshot?.name);
    console.log('Payment method:', paymentMethod);

    if (!uploadedScreenshot) {
      setError('Please upload payment screenshot before proceeding');
      return;
    }

    if (!bookingId) {
      setError('Booking ID not found. Please try booking again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const paymentData = {
        paymentMethod: paymentMethod || 'scan',
        paymentScreenshot: uploadedScreenshot,
        amount: parseFloat(officeData?.price?.replace(/[^\d.]/g, '') || '1500')
      };

      console.log('Submitting payment for booking:', bookingId);
      const paymentResult = await bookingService.submitPayment(bookingId, paymentData);

      if (paymentResult.success) {
        console.log('Payment submitted successfully:', paymentResult.data);

        const bookingData = paymentResult.data?.booking;
        const message = paymentResult.data?.message || paymentResult.message || 'Payment submitted successfully!';

        // Show success message
        const successMessage = `${message}\n\n` +
          `Booking ID: ${bookingData?.id || bookingId}\n` +
          `Amount: ₹${bookingData?.amount || paymentData.amount}\n` +
          `Status: ${bookingData?.status || 'Pending'}\n\n` +
          `Your booking is pending admin verification.`;

        alert(successMessage);

        // Navigate to success page or services
        navigate(ROUTES.SUCCESS, {
          state: {
            bookingId: bookingData?.id || bookingId,
            message: message,
            bookingData: bookingData
          }
        });
      } else {
        throw new Error(paymentResult.message || 'Payment submission failed');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingId || !officeData) {
    return null;
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      py: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        maxWidth: '800px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3 },
        mb: 3
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.SERVICES)}
          sx={{
            color: '#666',
            textTransform: 'none',
            mb: 2,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Back to Services
        </Button>
        
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          color: '#333',
          mb: 1
        }}>
          Complete Payment
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Upload your payment screenshot to complete the booking
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        maxWidth: '800px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3 }
      }}>
        {/* Booking Details Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              mb: 2,
              color: '#333'
            }}>
              Booking Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Booking ID:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  #{bookingId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Office Type:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {officeData?.title || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Amount to Pay:
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  color: '#E53935'
                }}>
                  {officeData?.price || '₹1,500'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Payment Method:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {paymentMethod === 'scan' ? 'UPI/QR Code' : 'Bank Transfer'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              mb: 2,
              color: '#333'
            }}>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {paymentMethod === 'scan' ? (
              <Box sx={{ textAlign: 'center' }}>
                <QrCodeIcon sx={{ fontSize: 80, color: '#E53935', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                  Scan QR Code to Pay
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  UPI ID: siva.beb-3@okhdfcbank
                </Typography>
              </Box>
            ) : (
              <Box>
                <AccountBalanceIcon sx={{ fontSize: 60, color: '#E53935', mb: 2, display: 'block', mx: 'auto' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                  Bank Transfer Details
                </Typography>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Account Holder:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        SIVA PRASAD SAHOO
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Account Number:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        50200089919337
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        IFSC Code:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        HDFC0009719
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Bank Name:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        HDFC Bank
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Branch:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Infocity, Bhubaneswar
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Upload Screenshot Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              mb: 2,
              color: '#333'
            }}>
              Upload Payment Screenshot
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{
                py: 2,
                mb: 2,
                borderColor: '#E53935',
                color: '#E53935',
                borderWidth: 2,
                borderStyle: 'dashed',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#C62828',
                  bgcolor: 'rgba(229, 57, 53, 0.05)',
                  borderWidth: 2
                }
              }}
            >
              {uploadedScreenshot ? 'Change Screenshot' : 'Choose Screenshot'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleScreenshotUpload}
              />
            </Button>

            {/* Screenshot Preview */}
            {screenshotPreview && (
              <Paper 
                elevation={2}
                sx={{ 
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 30 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      Screenshot Uploaded
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {uploadedScreenshot?.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  mt: 2,
                  textAlign: 'center'
                }}>
                  <img 
                    src={screenshotPreview} 
                    alt="Payment Screenshot" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </Box>
              </Paper>
            )}

            <Typography variant="caption" sx={{ 
              display: 'block',
              mt: 2,
              color: '#666',
              textAlign: 'center'
            }}>
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </Typography>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmitPayment}
          disabled={!uploadedScreenshot || isSubmitting}
          sx={{
            py: 2,
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'none',
            background: !uploadedScreenshot || isSubmitting
              ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
              : 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
            boxShadow: !uploadedScreenshot || isSubmitting
              ? 'none'
              : '0 4px 12px rgba(229, 57, 53, 0.3)',
            '&:hover': {
              background: !uploadedScreenshot || isSubmitting
                ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                : 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
              boxShadow: !uploadedScreenshot || isSubmitting
                ? 'none'
                : '0 6px 16px rgba(229, 57, 53, 0.4)',
              transform: !uploadedScreenshot || isSubmitting ? 'none' : 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
              color: '#666'
            }
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
              Submitting...
            </>
          ) : (
            'Submit Payment'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentUpload;
