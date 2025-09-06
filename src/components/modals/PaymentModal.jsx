import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { PAYMENT_METHODS, PAYMENT_STEPS, PAYMENT_CONFIG } from '../../constants/payment';
import { validateFile, createFileObject } from '../../utils/helpers/fileUtils';

/**
 * Payment Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Function} props.onSubmit - Function to submit payment
 * @param {Object} props.selectedOffice - Selected office details
 */
const PaymentModal = ({ open, onClose, onSubmit, selectedOffice }) => {
  const [paymentStep, setPaymentStep] = useState(PAYMENT_STEPS.SELECT_METHOD);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.SCAN);
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const handleClose = () => {
    setPaymentStep(PAYMENT_STEPS.SELECT_METHOD);
    setPaymentMethod(PAYMENT_METHODS.SCAN);
    setUploadedScreenshot(null);
    setScreenshotPreview(null);
    onClose();
  };

  const handleNext = () => {
    if (paymentStep === PAYMENT_STEPS.SELECT_METHOD) {
      setPaymentStep(PAYMENT_STEPS.UPLOAD_SCREENSHOT);
    } else if (paymentStep === PAYMENT_STEPS.UPLOAD_SCREENSHOT && uploadedScreenshot) {
      const paymentData = {
        method: paymentMethod,
        screenshot: uploadedScreenshot,
        office: selectedOffice,
        timestamp: new Date().toISOString(),
      };
      onSubmit(paymentData);
      handleClose();
    }
  };

  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const fileObject = createFileObject(file);
        setUploadedScreenshot(fileObject);
        setScreenshotPreview(fileObject.url);
      } else {
        alert(validation.error);
      }
    }
  };

  const isNextButtonDisabled = () => {
    if (paymentStep === PAYMENT_STEPS.SELECT_METHOD) return false;
    if (paymentStep === PAYMENT_STEPS.UPLOAD_SCREENSHOT) return !uploadedScreenshot;
    return false;
  };

  return (
    <Dialog 
      open={open}
      onClose={handleClose}
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
        onClick={handleClose}
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
      }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ 
            color: '#333',
            fontWeight: 'bold',
            fontSize: { xs: '28px', sm: '32px' },
            mb: 1
          }}
        >
          Complete Payment
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

      {/* Step Content */}
      <DialogContent sx={{ p: 0 }}>
        {paymentStep === PAYMENT_STEPS.SELECT_METHOD && (
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#333' }}>
              Choose Payment Method
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, md: 3 },
            }}>
              {/* Payment Options */}
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
                  <FormControlLabel
                    value={PAYMENT_METHODS.SCAN}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        width: '100%',
                        p: 2.5,
                        border: paymentMethod === PAYMENT_METHODS.SCAN ? '2px solid #9FE2DF' : '2px solid #e0e0e0',
                        borderRadius: '16px',
                        bgcolor: paymentMethod === PAYMENT_METHODS.SCAN ? 'rgba(159, 226, 223, 0.15)' : 'white',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#9FE2DF',
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                        }
                      }}>
                        <QrCodeIcon sx={{ 
                          color: paymentMethod === PAYMENT_METHODS.SCAN ? '#9FE2DF' : '#666', 
                          fontSize: 28,
                        }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: paymentMethod === PAYMENT_METHODS.SCAN ? 600 : 500,
                          color: paymentMethod === PAYMENT_METHODS.SCAN ? '#333' : '#666',
                        }}>
                          Scan and Pay
                        </Typography>
                        {paymentMethod === PAYMENT_METHODS.SCAN && (
                          <CheckCircleIcon sx={{ color: '#9FE2DF', fontSize: 20, ml: 'auto' }} />
                        )}
                      </Box>
                    }
                    sx={{ margin: 0, width: '100%', mb: 1.5 }}
                  />

                  <FormControlLabel
                    value={PAYMENT_METHODS.ACCOUNT}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        width: '100%',
                        p: 2.5,
                        border: paymentMethod === PAYMENT_METHODS.ACCOUNT ? '2px solid #9FE2DF' : '2px solid #e0e0e0',
                        borderRadius: '16px',
                        bgcolor: paymentMethod === PAYMENT_METHODS.ACCOUNT ? 'rgba(159, 226, 223, 0.15)' : 'white',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#9FE2DF',
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                        }
                      }}>
                        <AccountBalanceIcon sx={{ 
                          color: paymentMethod === PAYMENT_METHODS.ACCOUNT ? '#9FE2DF' : '#666', 
                          fontSize: 28,
                        }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: paymentMethod === PAYMENT_METHODS.ACCOUNT ? 600 : 500,
                          color: paymentMethod === PAYMENT_METHODS.ACCOUNT ? '#333' : '#666',
                        }}>
                          Account Details
                        </Typography>
                        {paymentMethod === PAYMENT_METHODS.ACCOUNT && (
                          <CheckCircleIcon sx={{ color: '#9FE2DF', fontSize: 20, ml: 'auto' }} />
                        )}
                      </Box>
                    }
                    sx={{ margin: 0, width: '100%' }}
                  />
                </RadioGroup>
              </Box>

              {/* Payment Method Content */}
              <Box sx={{ 
                flex: { xs: 1, md: '0 0 70%' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, sm: 4 },
                minHeight: { xs: '320px', md: '380px' },
              }}>
                {paymentMethod === PAYMENT_METHODS.SCAN && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ 
                      bgcolor: 'white',
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: '12px',
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0'
                    }}>
                      <QrCodeIcon sx={{ 
                        fontSize: { xs: 60, sm: 70 }, 
                        color: '#333', 
                        mb: 1
                      }} />
                      <Typography variant="body2" sx={{ 
                        color: '#666', 
                        fontSize: { xs: '11px', sm: '12px' }
                      }}>
                        Scan this QR code with your UPI app
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      bgcolor: 'rgba(159, 226, 223, 0.1)',
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid rgba(159, 226, 223, 0.3)',
                      width: '100%',
                      maxWidth: '250px'
                    }}>
                      <Typography variant="h6" sx={{ 
                        mb: 1, 
                        color: '#333', 
                        fontSize: { xs: '14px', sm: '16px' },
                        fontWeight: 'bold'
                      }}>
                        UPI ID: {PAYMENT_CONFIG.UPI_ID}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {paymentMethod === PAYMENT_METHODS.ACCOUNT && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      mb: 1, 
                      color: '#333', 
                      textAlign: 'center', 
                      fontSize: { xs: '18px', sm: '20px' },
                      fontWeight: 'bold'
                    }}>
                      Bank Account Details
                    </Typography>
                    
                    <Box sx={{ width: '100%', maxWidth: '320px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <AccountBalanceIcon sx={{ 
                          fontSize: { xs: 30, sm: 36 }, 
                          color: '#9FE2DF'
                        }} />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#666', 
                              fontWeight: 500, 
                              mb: 0.5, 
                              fontSize: { xs: '12px', sm: '13px' } 
                            }}>
                              Account Name:
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#333', 
                              fontWeight: 600, 
                              fontSize: { xs: '14px', sm: '15px' } 
                            }}>
                              {PAYMENT_CONFIG.BANK_DETAILS.accountName}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#666', 
                              fontWeight: 500, 
                              mb: 0.5, 
                              fontSize: { xs: '12px', sm: '13px' } 
                            }}>
                              Account Number:
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#333', 
                              fontWeight: 600, 
                              fontSize: { xs: '14px', sm: '15px' },
                              letterSpacing: '1px'
                            }}>
                              {PAYMENT_CONFIG.BANK_DETAILS.accountNumber}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#666', 
                              fontWeight: 500, 
                              mb: 0.5, 
                              fontSize: { xs: '12px', sm: '13px' } 
                            }}>
                              IFSC Code:
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#333', 
                              fontWeight: 600, 
                              fontSize: { xs: '13px', sm: '14px' } 
                            }}>
                              {PAYMENT_CONFIG.BANK_DETAILS.ifscCode}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#666', 
                              fontWeight: 500, 
                              mb: 0.5, 
                              fontSize: { xs: '12px', sm: '13px' } 
                            }}>
                              Bank Name:
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#333', 
                              fontWeight: 600, 
                              fontSize: { xs: '13px', sm: '14px' } 
                            }}>
                              {PAYMENT_CONFIG.BANK_DETAILS.bankName}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {paymentStep === PAYMENT_STEPS.UPLOAD_SCREENSHOT && (
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#333' }}>
              Upload Payment Screenshot
            </Typography>
            
            {selectedOffice && (
              <Box sx={{ 
                bgcolor: '#9FE2DF',
                p: 2,
                borderRadius: '8px',
                mb: 3,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                  Amount: {selectedOffice.price}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Payment Method: {paymentMethod === PAYMENT_METHODS.SCAN ? 'UPI/QR Code' : 'Bank Transfer'}
                </Typography>
              </Box>
            )}

            <Box sx={{ 
              border: '2px dashed #9FE2DF',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              bgcolor: '#f8f9fa',
              mb: 3
            }}>
              {screenshotPreview ? (
                <Box>
                  <img 
                    src={screenshotPreview} 
                    alt="Payment Screenshot" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500 }}>
                    Screenshot uploaded successfully!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CameraAltIcon sx={{ fontSize: 48, color: '#9FE2DF', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Upload Payment Screenshot
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                    Please upload a screenshot of your payment confirmation
                  </Typography>
                </Box>
              )}
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="screenshot-upload"
                type="file"
                onChange={handleScreenshotUpload}
              />
              <label htmlFor="screenshot-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    bgcolor: '#9FE2DF',
                    color: '#333',
                    '&:hover': {
                      bgcolor: '#7dd3d8'
                    }
                  }}
                >
                  {screenshotPreview ? 'Change Screenshot' : 'Choose File'}
                </Button>
              </label>
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
          onClick={handleClose}
          sx={{
            color: '#666',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            '&:hover': {
              bgcolor: 'rgba(102, 102, 102, 0.1)',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={isNextButtonDisabled()}
          variant="contained"
          sx={{
            background: isNextButtonDisabled() 
              ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' 
              : 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
            color: 'white',
            px: { xs: 3, sm: 5 },
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: '12px',
            '&:hover': {
              background: isNextButtonDisabled() 
                ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' 
                : 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
            },
          }}
        >
          {paymentStep === PAYMENT_STEPS.SELECT_METHOD ? 'Next' : 'Complete Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
