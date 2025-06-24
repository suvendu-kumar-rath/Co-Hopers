import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Paper, Fade, Input, Divider, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import privateOfficeImage from '../assets/images/Service Space .png';
import spaceImage4 from '../assets/images/03_Spaces 4.png';
import spaceImage6 from '../assets/images/03_Spaces 6.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import directorKYCImage from '../assets/images/KYC.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KYCImage from '../assets/images/KYC.png';

const Services = () => {
  const navigate = useNavigate();
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentStep, setPaymentStep] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [openKYCModal, setOpenKYCModal] = useState(false);
  const [kycType, setKYCType] = useState('company');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [signingAuthority, setSigningAuthority] = useState('');
  const [companyFiles, setCompanyFiles] = useState({
    coi: null,
    pan: null,
    gstin: null
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState({
    coi: null,
    pan: null,
    gstin: null
  });
  const [showDirectorKYC, setShowDirectorKYC] = useState(false);
  const [showCompanyKYC, setShowCompanyKYC] = useState(true);
  const [showSigningAuthorityKYC, setShowSigningAuthorityKYC] = useState(false);
  const [directorKYCFiles, setDirectorKYCFiles] = useState({
    paymentProof: null,
    frontID: null,
    backID: null,
    directorPAN: null,
    directorPhoto: null
  });
  const [formData, setFormData] = useState({
    companyName: '',
    directorName: '',
    din: '',
    email: '',
    mobile: ''
  });
  const [companyData, setCompanyData] = useState({
    companyName: '',
    directorName: '',
    din: '',
    email: '',
    mobile: ''
  });

  const handleOpenPaymentModal = () => {
    setOpenPaymentModal(true);
    setPaymentStep('select');
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setPaymentStep('select');
    setSelectedFile(null);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleNextStep = () => {
    setPaymentStep('upload');
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleBack = () => {
    setShowDirectorKYC(false);
    setShowSigningAuthorityKYC(false);
    setShowCompanyKYC(true);
    setOpenKYCModal(true);
  };

  const handleOpenKYCModal = () => {
    setOpenKYCModal(true);
    setOpenPaymentModal(false);
  };

  const handleCloseKYCModal = () => {
    setOpenKYCModal(false);
  };

  const handleKYCTypeChange = (event) => {
    setKYCType(event.target.value);
  };

  const handleNextInKYC = () => {
    if (kycType === 'company') {
      setShowCompanyForm(true);
    }
  };

  const handleBackToKYC = () => {
    setShowCompanyForm(false);
  };

  const handleFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleDirectorFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setDirectorKYCFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleNextClick = () => {
    console.log("Next clicked, signing authority:", signingAuthority);
    if (signingAuthority === 'director') {
      setShowDirectorKYC(true);
      setShowCompanyKYC(false);
      setShowSigningAuthorityKYC(false);
      setOpenKYCModal(false);
    } else if (signingAuthority === 'someone_else') {
      setShowSigningAuthorityKYC(true);
      setShowCompanyKYC(false);
      setShowDirectorKYC(false);
      setOpenKYCModal(false);
    }
  };

  const handleCloseDirectorKYC = () => {
    setShowDirectorKYC(false);
    setShowCompanyKYC(true);
  };

  const handleCompanyDataChange = (field) => (event) => {
    setCompanyData({
      ...companyData,
      [field]: event.target.value
    });
  };

  const handleRadioChange = (event) => {
    console.log("Radio changed to:", event.target.value);
    setSigningAuthority(event.target.value);
  };

  const handleCloseSigningAuthorityKYC = () => {
    setShowSigningAuthorityKYC(false);
    setShowCompanyKYC(true);
  };

  const handleOpenKYCForm = () => {
    if (selectedFile) {
      navigate('/form');  // Navigate to Form component
      handleClosePaymentModal();  // Close the payment modal after navigation
    }
  };

  const DirectorKYCDialog = () => (
    <Dialog 
      open={showDirectorKYC} 
      onClose={handleCloseDirectorKYC}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '1200px',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
        <Box sx={{ 
          bgcolor: '#75A5A3', 
          p: 2, 
          borderRadius: 1,
          mb: 4
        }}>
          <Typography variant="h5" sx={{ 
            color: 'white', 
            textAlign: 'center',
            fontWeight: 500
          }}>
            DIRECTOR KYC
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 4, fontWeight: 500 }}>
          Enter Your Details
        </Typography>

        <Box sx={{ display: 'flex' }}>
          {/* Left Section */}
          <Box sx={{ flex: 1, pr: 4 }}>
            {/* Upload Fields - Left Column */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Payment Proof*
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Upload 1 supported file. Max 10 MB.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ color: '#75A5A3' }} />}
                sx={{ 
                  color: '#75A5A3',
                  borderColor: '#75A5A3',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#75A5A3',
                    bgcolor: 'rgba(117, 165, 163, 0.04)'
                  }
                }}
              >
                ADD File
              </Button>

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Director Photo ID Card Front Side (Aadhar/Driving License/Voter ID)*
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Upload 1 supported file. Max 10 MB.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ color: '#75A5A3' }} />}
                sx={{ 
                  color: '#75A5A3',
                  borderColor: '#75A5A3',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#75A5A3',
                    bgcolor: 'rgba(117, 165, 163, 0.04)'
                  }
                }}
              >
                ADD File
              </Button>

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Director Photo ID Card Back Side (Aadhar/Driving License/Voter ID)*
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Upload 1 supported file. Max 10 MB.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ color: '#75A5A3' }} />}
                sx={{ 
                  color: '#75A5A3',
                  borderColor: '#75A5A3',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#75A5A3',
                    bgcolor: 'rgba(117, 165, 163, 0.04)'
                  }
                }}
              >
                ADD File
              </Button>
            </Box>

            {/* Text Fields */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Email-ID (Invoice will be sent)*"
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 1
                  }
                }}
              />

              <TextField
                fullWidth
                placeholder="Mobile Number*"
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 1
                  }
                }}
              />
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ flex: 1, pl: 4 }}>
            {/* Upload Fields - Right Column */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Director PAN*
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Upload 1 supported file. Max 10 MB.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ color: '#75A5A3' }} />}
                sx={{ 
                  color: '#75A5A3',
                  borderColor: '#75A5A3',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#75A5A3',
                    bgcolor: 'rgba(117, 165, 163, 0.04)'
                  }
                }}
              >
                ADD File
              </Button>

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Director Photo*
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                Upload 1 supported file. Max 10 MB.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ color: '#75A5A3' }} />}
                sx={{ 
                  color: '#75A5A3',
                  borderColor: '#75A5A3',
                  textTransform: 'none',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#75A5A3',
                    bgcolor: 'rgba(117, 165, 163, 0.04)'
                  }
                }}
              >
                ADD File
              </Button>
            </Box>

            {/* KYC Illustration */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'flex-start',
              mt: 4
            }}>
              <img 
                src={KYCImage} 
                alt="KYC Illustration" 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto'
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer Text */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Thank you for Connecting with us.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Note: By submitting this KYC form, you acknowledge and agree to abide by the rules of Cohopers Coworking as established in the agreement between your company and 9C Technology Labs Pvt. Ltd.
          </Typography>
          <Typography variant="body2">
            Team Cohopers
          </Typography>
          <Typography variant="body2">
            9C Technology labs Pvt. Ltd.
          </Typography>
        </Box>

        {/* Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 4
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              bgcolor: 'white',
              px: 4,
              '&:hover': {
                borderColor: '#75A5A3',
                bgcolor: 'rgba(117, 165, 163, 0.04)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            sx={{ 
              bgcolor: '#8BC34A',
              color: 'white',
              px: 4,
              '&:hover': {
                bgcolor: '#7CB342'
              }
            }}
          >
            SUBMIT
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const SigningAuthorityKYCDialog = () => (
    <Dialog 
      open={showSigningAuthorityKYC} 
      onClose={handleCloseSigningAuthorityKYC}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '1200px',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
        <Box sx={{ 
          bgcolor: '#75A5A3', 
          p: 2, 
          borderRadius: 1,
          mb: 4
        }}>
          <Typography variant="h5" sx={{ 
            color: 'white', 
            textAlign: 'center',
            fontWeight: 500
          }}>
            SIGNING AUTHORITY KYC
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Enter Your Details</Typography>
        
        <TextField
          fullWidth
          placeholder="Enter your details"
          variant="outlined"
          sx={{ 
            mb: 4,
            maxWidth: '500px',
            bgcolor: 'white'
          }}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {/* Left Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3
            }}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Authorization Letter from Company*
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  (Note: Granting power to signing authority to sign on behalf of company.)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Photo ID Card Front Side (Aadhar/Driving License/Voter ID)*
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Photo ID Card Back Side (Aadhar/Driving License/Voter ID)*
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Email-ID (Invoice will be sent)*"
                variant="outlined"
                sx={{ bgcolor: 'white' }}
              />

              <TextField
                fullWidth
                label="Mobile Number*"
                variant="outlined"
                sx={{ bgcolor: 'white' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Right Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              pl: { xs: 0, md: 8 },
              ml: { xs: 0, md: 12 }
            }}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Payment Proof*
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Signing Authority Photo*
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Signing Authority PAN*
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ 
                    width: '100%',
                    height: '45px',
                    borderColor: '#75A5A3',
                    color: '#75A5A3',
                    '&:hover': {
                      borderColor: '#75A5A3',
                      bgcolor: 'rgba(117, 165, 163, 0.04)'
                    }
                  }}
                >
                  ADD File
                  <input type="file" hidden />
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Upload 1 supported file. Max 10 MB.
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <img 
                  src={KYCImage}
                  alt="KYC Illustration" 
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto'
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Thank you for Connecting with us.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Note: By submitting this KYC form, you acknowledge and agree to abide by the rules of Cohopers Coworking as established in the agreement between your company and 9C Technology Labs Pvt. Ltd.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Team CoHopers
          </Typography>
          <Typography variant="body2">
            9C Technology labs Pvt. Ltd.
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 4
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              px: 4,
              '&:hover': {
                borderColor: '#75A5A3',
                bgcolor: 'rgba(117, 165, 163, 0.04)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            sx={{ 
              bgcolor: '#8BC34A',
              color: 'white',
              px: 4,
              '&:hover': {
                bgcolor: '#7CB342'
              }
            }}
          >
            SUBMIT
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const CompanyKYCDialog = () => (
    <Dialog
      open={showCompanyKYC}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '1200px',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
        <Box sx={{ 
          bgcolor: '#75A5A3', 
          p: 2, 
          borderRadius: 1,
          mb: 4
        }}>
          <Typography variant="h5" sx={{ 
            color: 'white', 
            textAlign: 'center',
            fontWeight: 500
          }}>
            COMPANY KYC
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3
            }}>
              <TextField
                fullWidth
                label="Company Name*"
                variant="outlined"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                sx={{ width: '130%' }}
              />
              <TextField
                fullWidth
                label="Director's Name*"
                variant="outlined"
                value={companyData.directorName}
                onChange={(e) => setCompanyData({...companyData, directorName: e.target.value})}
                sx={{ width: '130%' }}
              />
              <TextField
                fullWidth
                label="DIN*"
                variant="outlined"
                value={companyData.din}
                onChange={(e) => setCompanyData({...companyData, din: e.target.value})}
                sx={{ width: '130%' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              pl: { xs: 0, md: 12 },
              ml: { xs: 0, md: 22 },
              mb: 20
            }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  color: '#333',
                  fontWeight: 400
                }}>
                  Who is the signing authority?*
                </Typography>
                <RadioGroup
                  value={signingAuthority}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel 
                    value="director" 
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': {
                            color: '#9FE2DF',
                          }
                        }}
                      />
                    } 
                    label="Director" 
                  />
                  <FormControlLabel 
                    value="someone_else" 
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': {
                            color: '#9FE2DF',
                          }
                        }}
                      />
                    } 
                    label="Someone else" 
                  />
                </RadioGroup>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 4 
        }}>
          <Button
            variant="outlined"
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              '&:hover': {
                borderColor: '#75A5A3',
                bgcolor: 'rgba(117, 165, 163, 0.04)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNextClick}
            disabled={!signingAuthority}
            sx={{ 
              bgcolor: '#8BC34A',
              color: 'white',
              '&:hover': {
                bgcolor: '#7CB342'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(139, 195, 74, 0.5)',
                color: 'white'
              }
            }}
          >
            Next
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'white' }}>
      {/* Title Section */}
      <Box sx={{ 
        px: 4,
        pt: 4,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ArrowBackIcon sx={{ fontSize: 24, color: '#333' }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '24px',
              color: '#333'
            }}
          >
            PRIVATE OFFICES
          </Typography>
        </Box>
      </Box>

      {/* Main Content Section */}
      <Box sx={{ 
        bgcolor: '#9FE2DF',
        py: 4,
        px: 4,
        borderRadius: '0px'
      }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              borderRadius: '24px',
              overflow: 'hidden',
              mb: 3,
              maxWidth: '500px',
              marginLeft: 0,
              marginRight: 'auto',
              '& img': {
                width: '100%',
                height: '300px',
                display: 'block',
                objectFit: 'cover'
              }
            }}>
              <img src={privateOfficeImage} alt="Private Office" />
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'white',
                mb: 3,
                fontSize: '18px',
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: '500px'
              }}
            >
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              component="h3"
              sx={{ 
                color: '#333',
                mb: 4,
                fontWeight: 'bold',
                borderBottom: '2px solid white',
                pb: 2
              }}
            >
              Private Cabin ( 4 Seater )
            </Typography>

            <List sx={{ mt: 2 }}>
              {[
                'High-speed internet connectivity',
                'Ergonomic furniture and setup',
                'Access to meeting rooms',
                'Dedicated storage space',
                'Air conditioning and lighting',
                'Cleaning and maintenance',
                'Security and access control',
                '24/7 access available'
              ].map((feature, index) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    py: 0.5,
                    px: 0
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                    <CheckIcon sx={{ color: '#333' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#333',
                        fontSize: '16px',
                        fontWeight: 500
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  display: 'inline-block',
                  bgcolor: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: '8px',
                  color: '#333',
                  fontWeight: 'bold'
                }}
              >
                ₹18k + GST Per Month
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Payment Button Section */}
      <Box sx={{ 
        px: 4,
        pt: 0,
        pb: 3,
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: '-30px'
      }}>
        <Button
          variant="contained"
          onClick={handleOpenPaymentModal}
          sx={{
            bgcolor: '#E53935',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            marginLeft: '64px',
            '&:hover': {
              bgcolor: '#C62828'
            }
          }}
        >
          PROCEED TO PAYMENT
        </Button>
      </Box>

      {/* Payment Modal */}
      <Dialog 
        open={openPaymentModal} 
        onClose={handleClosePaymentModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#9FE2DF', 
          color: '#333',
          fontWeight: 'bold',
          py: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          {paymentStep === 'select' ? 'Payment Gateway' : 'Upload Payment Details'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 4 }}>
          {paymentStep === 'select' ? (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <Paper 
                    elevation={paymentMethod === 'upi' ? 3 : 0}
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: paymentMethod === 'upi' ? '2px solid #9FE2DF' : '1px solid rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <FormControlLabel 
                      value="upi" 
                      control={<Radio />} 
                      label={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          UPI Payment
                        </Typography>
                      }
                    />
                  </Paper>

                  <Paper 
                    elevation={paymentMethod === 'netbanking' ? 3 : 0}
                    sx={{ 
                      p: 2,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: paymentMethod === 'netbanking' ? '2px solid #9FE2DF' : '1px solid rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <FormControlLabel 
                      value="netbanking" 
                      control={<Radio />} 
                      label={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Net Banking
                        </Typography>
                      }
                    />
                  </Paper>
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={7}>
                <Fade in={true} timeout={500}>
                  <Box>
                    {paymentMethod === 'upi' ? (
                      <Paper 
                        elevation={3}
                        sx={{ 
                          p: 3,
                          borderRadius: '12px',
                          textAlign: 'center',
                          bgcolor: '#f8f8f8',
                          marginLeft: '250px'
                        }}
                      >
                        <Box 
                          sx={{
                            width: '200px',
                            height: '200px',
                            margin: '0 auto',
                            bgcolor: 'white',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            mb: 2
                          }}
                        >
                          <QrCodeIcon sx={{ fontSize: 150, color: '#333' }} />
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#333', textAlign: 'center' }}>
                          Scan QR Code to Pay
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mt: 1, textAlign: 'center' }}>
                          Please use any UPI app to scan and pay
                        </Typography>
                      </Paper>
                    ) : (
                      <Paper 
                        elevation={3}
                        sx={{ 
                          p: 3,
                          borderRadius: '12px',
                          textAlign: 'center',
                          bgcolor: '#f8f8f8',
                          marginLeft: '250px'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                          Bank Account Details
                        </Typography>
                        <Box sx={{ 
                          '& > *': { mb: 2 },
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: '8px'
                        }}>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>Name:</span>
                            <span>9C tech Lab Private Limited</span>
                          </Typography>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>Account Number:</span>
                            <span>XXXXXXXX1234</span>
                          </Typography>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>Bank Name:</span>
                            <span>HDFC Bank</span>
                          </Typography>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>IFSC Code:</span>
                            <span>HDFC0001234</span>
                          </Typography>
                          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>Branch Name:</span>
                            <span>Bangalore Main Branch</span>
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ py: 3 }}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 4,
                  borderRadius: '12px',
                  bgcolor: '#f8f8f8'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    pb: 1
                  }}>
                    Payment Details
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                        Payment Mode
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 500, 
                        color: '#333',
                        bgcolor: 'white',
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        {paymentMethod === 'upi' ? 'UPI Payment' : 'Net Banking'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                        Amount
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 500, 
                        color: '#333',
                        bgcolor: 'white',
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        ₹18k + GST
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ 
                        color: '#666', 
                        mb: 2,
                        fontSize: '16px',
                        fontWeight: 500
                      }}>
                        Upload Payment Screenshot
                      </Typography>
                      <Box
                        sx={{
                          p: 6,
                          border: '2px dashed #9FE2DF',
                          borderRadius: '12px',
                          textAlign: 'center',
                          bgcolor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '250px',
                          '&:hover': {
                            bgcolor: 'rgba(159, 226, 223, 0.1)',
                            border: '2px dashed #7CABA8'
                          }
                        }}
                        component="label"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleFileSelect}
                        />
                        <Box sx={{
                          width: '80px',
                          height: '80px',
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}>
                          <CloudUploadIcon sx={{ 
                            fontSize: 40, 
                            color: '#9FE2DF'
                          }} />
                        </Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#333', 
                          mb: 1,
                          fontSize: '18px'
                        }}>
                          {selectedFile ? selectedFile.name : 'Click to upload screenshot'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontSize: '14px'
                        }}>
                          Supported formats: JPG, PNG, JPEG
                        </Typography>
                      </Box>
                      {selectedFile && (
                        <Box sx={{ 
                          mt: 2,
                          p: 2,
                          bgcolor: 'rgba(159, 226, 223, 0.1)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: '#4CAF50',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            ✓ File selected: {selectedFile.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={paymentStep === 'select' ? handleClosePaymentModal : () => setPaymentStep('select')}
            variant="outlined"
            sx={{ 
              color: '#333',
              borderColor: '#333',
              mr: 1,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                borderColor: '#000',
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            {paymentStep === 'select' ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            variant="contained"
            onClick={paymentStep === 'select' ? handleNextStep : handleOpenKYCForm}
            disabled={paymentStep === 'upload' && !selectedFile}
            sx={{
              bgcolor: '#E53935',
              color: 'white',
              borderRadius: '8px',
              px: 4,
              '&:hover': {
                bgcolor: '#C62828'
              }
            }}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Modal */}
      <Dialog
        open={openKYCModal}
        onClose={handleCloseKYCModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        {!showCompanyForm ? (
          <>
            <DialogTitle sx={{ 
              bgcolor: '#9FE2DF', 
              color: '#333',
              fontWeight: 'bold',
              py: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              textAlign: 'center'
            }}>
              KYC for Co-Working CoHopers 9C Technology Labs Pvt. Ltd.
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#333', mb: 2 }}>
                  Credential Needed:
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 500 }}>
                    1. For a Company:
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>- Documents Required:</Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>- Certificate of Incorporation (proof that your company is legally registered).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- PAN of the Company (for tax identification).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- ID Card and PAN Card of the Director or Signing Authority (for identification and authorization).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- GSTIN (if available): If you provide your GSTIN, a GST Invoice will be issued.</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 500 }}>
                    2. For a Freelancer:
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>- Documents Required:</Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>- PAN Card (for tax identification).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- ID Card (for identity verification).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- GSTIN (Optional): You don't need to provide GSTIN if you're a freelancer, but if you have one, you may use it for invoicing.</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 500 }}>
                    3. For Sole-Proprietorship or Partnership Firm:
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>- Documents Required:</Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>- Choose as Freelancer: For registration purposes, you may be asked to choose as a freelancer.</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- PAN and ID Card of the Proprietor or Partner (for identification and tax purposes).</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>- GSTIN (Optional): You're not required to provide GSTIN unless you have one.</Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ color: '#666', mt: 2 }}>
                  Let us know if you need further clarification! ( +91 97787 08100 ).
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ 
                  color: '#333', 
                  mb: 3, 
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  KYC for Co-Working
                </Typography>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Company or Freelancer ?*
                  </Typography>
                  <RadioGroup
                    value={kycType}
                    onChange={handleKYCTypeChange}
                    sx={{ ml: 2 }}
                  >
                    <FormControlLabel 
                      value="company" 
                      control={
                        <Radio 
                          sx={{
                            '&.Mui-checked': {
                              color: '#9FE2DF',
                            }
                          }}
                        />
                      } 
                      label="Company" 
                    />
                    <FormControlLabel 
                      value="freelancer" 
                      control={
                        <Radio 
                          sx={{
                            '&.Mui-checked': {
                              color: '#9FE2DF',
                            }
                          }}
                        />
                      } 
                      label="Freelancer" 
                    />
                  </RadioGroup>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Button 
                onClick={handleCloseKYCModal}
                variant="outlined"
                sx={{ 
                  color: '#333',
                  borderColor: '#333',
                  mr: 1,
                  borderRadius: '8px',
                  px: 3,
                  '&:hover': {
                    borderColor: '#000',
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Back
              </Button>
              <Button 
                variant="contained"
                onClick={handleNextInKYC}
                sx={{
                  bgcolor: '#E53935',
                  color: 'white',
                  borderRadius: '8px',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#C62828'
                  }
                }}
              >
                Next
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            {/* Company KYC Dialog */}
            <CompanyKYCDialog />

            {/* Director KYC Dialog */}
            <DirectorKYCDialog />

            {/* Signing Authority KYC Dialog */}
            <SigningAuthorityKYCDialog />
          </>
        )}
      </Dialog>

      {/* Similar Search Section */}
      <Box sx={{ 
        bgcolor: 'white',
        py: 6,
        px: 0
      }}>
        <Box sx={{ px: 4 }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              color: '#333',
              mb: 4,
              textAlign: 'left'
            }}
          >
            Similar Search
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ marginLeft: '100px' }}>
          {[
            { 
              image: spaceImage4,
            },
            {
              image: spaceImage6,
            }
          ].map((item, index) => (
            <Grid item xs={12} md={6} key={index} sx={{ px: 0 }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '0px',
                boxShadow: 'none',
                maxWidth: '100%'
              }}>
                <CardMedia
                  component="img"
                  image={item.image}
                  alt="Office Space"
                  sx={{ 
                    height: 600,
                    objectFit: 'cover',
                    width: '100%'
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Services; 