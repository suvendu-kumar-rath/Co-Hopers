import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Grid, Paper, TextField, Divider, Accordion, AccordionSummary, AccordionDetails, RadioGroup, FormControlLabel, Radio, FormControl, InputLabel, MenuItem, Select, CircularProgress, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import KYCImage from '../../assets/images/KYC.png';
import FreelancerKYCImage from '../../assets/images/freelancer.png';
import { ROUTES } from '../../constants/routes';
import FileUpload from '../common/FileUpload';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

const KYCForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Note: KYC is now independent of any space booking
  // No space ID or booking data is required during KYC submission
  
  const [expanded, setExpanded] = useState('panel1');
  const [selectedOption, setSelectedOption] = useState('Director');
  const [companyKYCCompleted, setCompanyKYCCompleted] = useState(false);
  const [kycType, setKYCType] = useState('company');
  const [signingAuthority, setSigningAuthority] = useState('director');
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: '',
    directorName: '',
    din: '',
    email: '',
    mobile: '',
    gstNumber: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    coi: null,
    pan: null,
    gstin: null
  });
  const [directorFiles, setDirectorFiles] = useState({
    paymentProof: null,
    frontID: null,
    backID: null,
    pan: null,
    photo: null
  });
  const [signingAuthorityFiles, setSigningAuthorityFiles] = useState({
    authLetter: null,
    frontID: null,
    backID: null,
    paymentProof: null,
    photo: null,
    pan: null
  });
  const [freelancerFiles, setFreelancerFiles] = useState({
    gstin: null,
    frontID: null,
    backID: null,
    paymentScreenshot: null,
    memberPhoto: null,
    memberPAN: null
  });

  // Freelancer form data state
  const [freelancerData, setFreelancerData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const handleAccordionChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleKYCTypeChange = (event) => {
    setKYCType(event.target.value);
  };

  const handleRadioChange = (event) => {
    setSigningAuthority(event.target.value);
  };

  const handleCompanyKYCNext = () => {
    setCompanyKYCCompleted(true);
    if (signingAuthority === 'director') {
      setExpanded('panel3');
    } else if (signingAuthority === 'someone_else') {
      setExpanded('panel4');
    }
  };

  const handleFirstNext = () => {
    if (kycType === 'freelancer') {
      setExpanded('panel5'); // Open Freelancer KYC
    } else {
      setExpanded('panel2'); // Open Company KYC
    }
  };

  const handleFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png';
      
      if (isValidType && file.size <= 10 * 1024 * 1024) { // 10MB max
        setUploadedFiles(prev => ({
          ...prev,
          [type]: {
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file)
          }
        }));
      } else {
        alert('Please upload a PDF, JPG, or PNG file under 10MB');
      }
    }
  };

  const handleDirectorFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png';
      
      if (isValidType && file.size <= 10 * 1024 * 1024) {
        const fileObj = {
          file,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        };
        setDirectorFiles(prev => ({
          ...prev,
          [type]: fileObj
        }));
      } else {
        alert('Please upload a PDF, JPG, or PNG file under 10MB');
      }
    }
  };

  const handleSigningAuthorityFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png';
      
      if (isValidType && file.size <= 10 * 1024 * 1024) {
        setSigningAuthorityFiles(prev => ({
          ...prev,
          [type]: {
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file)
          }
        }));
      } else {
        alert('Please upload a PDF, JPG, or PNG file under 10MB');
      }
    }
  };

  const handleFreelancerFileUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png';
      
      if (isValidType && file.size <= 10 * 1024 * 1024) {
        const fileObj = {
          file,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        };
        setFreelancerFiles(prev => ({
          ...prev,
          [type]: fileObj
        }));
      } else {
        alert('Please upload a PDF, JPG, or PNG file under 10MB');
      }
    }
  };

  const handleBackToCompanyKYC = () => {
    setExpanded('panel2');
  };

  const handleBackToKYCInfo = () => {
    setExpanded('panel1');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      console.log("user:", user);
      
      // Prepare KYC data based on the selected type
      const kycData = {
        kycType,
        signingAuthority: kycType === 'company' ? signingAuthority : null,
        companyData: kycType === 'company' ? companyData : null,
        uploadedFiles: kycType === 'company' ? uploadedFiles : null,
        directorFiles: kycType === 'company' && signingAuthority === 'director' ? directorFiles : null,
        signingAuthorityFiles: kycType === 'company' && signingAuthority === 'signing-authority' ? signingAuthorityFiles : null,
        freelancerFiles: kycType === 'freelancer' ? freelancerFiles : null,
        freelancerData: kycType === 'freelancer' ? freelancerData : null, // Add freelancer form data
        submittedAt: new Date().toISOString(),
        userId: user?.id || user?.userId,
        userEmail: user?.email,
        userName: user?.name || user?.userName,
        user: user // Pass the full user object for accessing mobile/phone number
      };
      
      console.log('Submitting KYC data:', kycData);
      
      // KYC submission is now always independent of booking
      // No space ID or booking is created during KYC submission
      // User can book any space after KYC approval
      console.log('Submitting KYC only - no booking or space ID required');
      
      const kycOnlyResult = await bookingService.submitKYCOnly(kycData);
      
      if (!kycOnlyResult.success) {
        throw new Error(kycOnlyResult.message || 'KYC submission failed');
      }

      console.log('KYC submitted successfully:', kycOnlyResult.data);
      
      setSubmitSuccess(true);
      
      // Navigate to success page
      setTimeout(() => {
        navigate(ROUTES.PENDING_REVIEW, {
          state: {
            kycId: kycOnlyResult.data?.kycId,
            message: 'Your KYC has been submitted successfully! You can proceed with booking once approved.'
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Button Component
  const SubmitButton = () => (
    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={isSubmitting}
      sx={{ 
        bgcolor: isSubmitting ? '#ccc' : '#8BC34A',
        color: 'white',
        '&:hover': {
          bgcolor: isSubmitting ? '#ccc' : '#7CB342'
        },
        minWidth: '120px'
      }}
    >
      {isSubmitting ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          Submitting...
        </Box>
      ) : submitSuccess ? (
        'SUCCESS ✓'
      ) : (
        'SUBMIT'
      )}
    </Button>
  );

  const FileUploadButton = ({ type, label }) => {
    const file = uploadedFiles[type];

    return (
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1 }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Upload 1 supported file. Max 10 MB.
        </Typography>
        
        {!file ? (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              '&:hover': {
                borderColor: '#75A5A3'
              }
            }}
          >
            ADD File
            <input 
              type="file" 
              hidden 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload(type)}
            />
          </Button>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 2,
            border: '1px solid #75A5A3',
            borderRadius: 1,
            bgcolor: 'rgba(117, 165, 163, 0.1)'
          }}>
            {file.type === 'application/pdf' ? (
              <PictureAsPdfIcon sx={{ color: '#75A5A3', mr: 1 }} />
            ) : (
              <ImageIcon sx={{ color: '#75A5A3', mr: 1 }} />
            )}
            <Typography 
              sx={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
            <CheckCircleIcon sx={{ color: '#4CAF50', ml: 1 }} />
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                setUploadedFiles(prev => ({
                  ...prev,
                  [type]: null
                }));
              }}
            >
              Change
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const DirectorFileUpload = ({ type, label,  e }) => {
    const file = directorFiles[type];

    // Accept note as a prop
    const note = e && e.note ? e.note : undefined;

    return (
      <Box>
        <Typography sx={{ mb: 1 }}>
          {label}
          {note && (
            <Typography 
              component="span" 
              sx={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              {note}
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Upload 1 supported file. Max 10 MB.
        </Typography>
        
        {!file ? (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              '&:hover': {
                borderColor: '#75A5A3'
              }
            }}
          >
            ADD File
            <input 
              type="file" 
              hidden 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleDirectorFileUpload(type)}
            />
          </Button>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 2,
            border: '1px solid #75A5A3',
            borderRadius: 1,
            bgcolor: 'rgba(117, 165, 163, 0.1)'
          }}>
            {file.type === 'application/pdf' ? (
              <PictureAsPdfIcon sx={{ color: '#75A5A3', mr: 1 }} />
            ) : (
              <ImageIcon sx={{ color: '#75A5A3', mr: 1 }} />
            )}
            <Typography 
              sx={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
            <CheckCircleIcon sx={{ color: '#4CAF50', ml: 1 }} />
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                setDirectorFiles(prev => ({
                  ...prev,
                  [type]: null
                }));
              }}
            >
              Change
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const SigningAuthorityFileUpload = ({ type, label, note }) => {
    const file = signingAuthorityFiles[type];

    return (
      <Box>
        <Typography sx={{ mb: 1 }}>
          {label}
          {note && (
            <Typography 
              component="span" 
              sx={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              {note}
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Upload 1 supported file. Max 10 MB.
          </Typography>

        {!file ? (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              '&:hover': {
                borderColor: '#75A5A3'
              }
            }}
          >
            ADD File
            <input 
              type="file" 
              hidden 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleSigningAuthorityFileUpload(type)}
            />
          </Button>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 2,
            border: '1px solid #75A5A3',
            borderRadius: 1,
            bgcolor: 'rgba(117, 165, 163, 0.1)'
          }}>
            {file.type === 'application/pdf' ? (
              <PictureAsPdfIcon sx={{ color: '#75A5A3', mr: 1 }} />
            ) : (
              <ImageIcon sx={{ color: '#75A5A3', mr: 1 }} />
            )}
            <Typography 
              sx={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
            <CheckCircleIcon sx={{ color: '#4CAF50', ml: 1 }} />
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                setSigningAuthorityFiles(prev => ({
                  ...prev,
                  [type]: null
                }));
              }}
            >
              Change
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const FreelancerFileUpload = ({ type, label, note }) => {
    const file = freelancerFiles[type];
    
    return (
      <Box>
        <Typography sx={{ mb: 1 }}>
          {label}
          {note && (
            <Typography 
              component="span" 
              sx={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              {note}
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Upload 1 supported file. Max 10 MB.
        </Typography>
        
        {!file ? (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              color: '#75A5A3',
              borderColor: '#75A5A3',
              '&:hover': {
                borderColor: '#75A5A3'
              }
            }}
          >
            ADD File
            <input 
              type="file" 
              hidden 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFreelancerFileUpload(type)}
            />
          </Button>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 2,
            border: '1px solid #75A5A3',
            borderRadius: 1,
            bgcolor: 'rgba(117, 165, 163, 0.1)'
          }}>
            {file.type === 'application/pdf' ? (
              <PictureAsPdfIcon sx={{ color: '#75A5A3', mr: 1 }} />
            ) : (
              <ImageIcon sx={{ color: '#75A5A3', mr: 1 }} />
            )}
            <Typography 
              sx={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
            <CheckCircleIcon sx={{ color: '#4CAF50', ml: 1 }} />
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                setFreelancerFiles(prev => ({
                  ...prev,
                  [type]: null
                }));
              }}
            >
              Change
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2, sm: 3, md: 4 }, 
      bgcolor: '#fff' 
    }}>
      <Box sx={{ 
        maxWidth: '1200px', 
        mx: 'auto',
        width: '100%'
      }}>
        
        {/* Submission Feedback */}
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setSubmitError(null)}
          >
            {submitError}
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
          >
            KYC and booking submitted successfully! Redirecting to confirmation page...
          </Alert>
        )}
        
        {/* Show booking info if available */}
        <Accordion 
          expanded={expanded === 'panel1'} 
          onChange={handleAccordionChange('panel1')}
          sx={{ 
            mb: 2,
            borderRadius: { xs: '8px', sm: '12px' },
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              KYC for Co-Working CoHopers 9C Technology Labs Pvt. Ltd.
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ 
            p: { xs: 2, sm: 3, md: 4 }
          }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 2, sm: 3 }, 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' }
                }}
              >
                Credential Needed :
              </Typography>

              {/* For a Company Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.2rem' }
                  }}
                >
                  1. For a Company:
                </Typography>
                <Box sx={{ pl: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    - Documents Required:
                  </Typography>
                  <Box sx={{ pl: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      - Certificate of Incorporation (proof that your company is legally registered).
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>- PAN of the Company (for tax identification).</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>- ID Card and PAN Card of the Director or Signing Authority (for identification and authorization).</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>- GSTIN (if available): If you provide your GSTIN, a GST Invoice will be issued.</Typography>
                  </Box>
                </Box>
              </Box>

              {/* For a Freelancer Section */}
              <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
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

              {/* For Sole-Proprietorship Section */}
              <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
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

              <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
              Let us know if you need further clarification! ( +91 97787 08100 ).
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" sx={{ 
              textAlign: 'center',
                mb: 4,
                fontWeight: 'bold'
            }}>
              KYC for Co-Working
            </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
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
                          '&.Mui-checked': { color: '#75A5A3' }
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
                          '&.Mui-checked': { color: '#75A5A3' }
                      }}
                    />
                  } 
                  label="Freelancer" 
                />
              </RadioGroup>
            </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleFirstNext}
                  sx={{ 
                    bgcolor: '#75A5A3',
                    color: 'white',
                    px: 4,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      bgcolor: '#638e8c'
                    }
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Company KYC Section - Only show if company is selected */}
        {kycType === 'company' && (
          <>
            <Accordion 
              expanded={expanded === 'panel2'} 
              onChange={handleAccordionChange('panel2')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#75A5A3',
                  color: 'white',
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: 'white',
                  },
                }}
              >
                <Typography variant="h6">Company KYC</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 500,
                    textAlign: 'left',
                    mr: 'auto',
                    pl: 2
                  }}
                >
                  Enter Your Details
                </Typography>

                <Grid container spacing={6}>
                  {/* Left Section */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pr: 4 }}>
                      <TextField
                        fullWidth
                        placeholder="Company Registered Name*"
                        variant="outlined"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                      />
                      
                      <TextField
                        fullWidth
                        placeholder="Director's Name*"
                        variant="outlined"
                        value={companyData.directorName}
                        onChange={(e) => setCompanyData({...companyData, directorName: e.target.value})}
                      />
                      
                      <TextField
                        fullWidth
                        placeholder="DIN*"
                        variant="outlined"
                        value={companyData.din}
                        onChange={(e) => setCompanyData({...companyData, din: e.target.value})}
                      />

                      <TextField
                        fullWidth
                        placeholder="GST Number*"
                        variant="outlined"
                        value={companyData.gstNumber}
                        onChange={(e) => setCompanyData({...companyData, gstNumber: e.target.value})}
                      />

                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Who is the signing authority?*
                        </Typography>
                        <RadioGroup
                          value={signingAuthority}
                          onChange={handleRadioChange}
                        >
                          <FormControlLabel 
                            value="director" 
                            control={<Radio sx={{ '&.Mui-checked': { color: '#75A5A3' } }} />} 
                            label="Director" 
                          />
                          <FormControlLabel 
                            value="someone_else" 
                            control={<Radio sx={{ '&.Mui-checked': { color: '#75A5A3' } }} />} 
                            label="Someone else" 
                          />
                        </RadioGroup>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right Section */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4, 
                      ml: { xs: 0, md: 8 }
                    }}>
                      <FileUploadButton 
                        type="coi" 
                        label="Certificate of Incorporation (COI)*" 
                      />
                      <FileUploadButton 
                        type="pan" 
                        label="Company PAN*" 
                      />
                      <FileUploadButton 
                        type="gstin" 
                        label="GSTIN*" 
                      />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Button
                          variant="outlined"
                          onClick={handleBackToKYCInfo}
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
                          onClick={handleCompanyKYCNext}
                          sx={{ 
                            bgcolor: '#75A5A3',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#638e8c'
                            }
                          }}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Director KYC Section - Only show if director is selected */}
            {signingAuthority === 'director' && (
              <Accordion 
                expanded={expanded === 'panel3' && companyKYCCompleted} 
                onChange={handleAccordionChange('panel3')}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: '#75A5A3',
                    color: 'white',
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: 'white',
                    },
                  }}
                >
                  <Typography variant="h6">DIRECTOR KYC</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4, 
                      fontWeight: 500,
                      textAlign: 'left',
                      mr: 'auto',
                      pl: 2
                    }}
                  >
                    Enter Your Details
                  </Typography>
                  
                  <Grid container spacing={4}>
                    {/* Left Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <DirectorFileUpload 
                          type="frontID" 
                          label="Director Photo ID Card Front Side (Aadhar/Driving License/Voter ID)*" 
                        />
                        <DirectorFileUpload 
                          type="backID" 
                          label="Director Photo ID Card Back Side (Aadhar/Driving License/Voter ID)*" 
                        />

                        <TextField
                          fullWidth
                          placeholder="Email-ID (Invoice will be sent)*"
                          variant="outlined"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                          sx={{ 
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white'
                            }
                          }}
                        />

                        <TextField
                          fullWidth
                          placeholder="Mobile Number*"
                          variant="outlined"
                          value={companyData.mobile}
                          onChange={(e) => setCompanyData({...companyData, mobile: e.target.value})}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white'
                            }
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Right Section */}
                    <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3,
                        ml: { xs: 0, md: 8 }
                      }}>
                        <DirectorFileUpload 
                          type="pan" 
                          label="Director PAN*" 
                        />
                        <DirectorFileUpload 
                          type="photo" 
                          label="Director Photo*" 
                        />

                        {/* KYC Image */}
                        <Box sx={{ mt: 4 }}>
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

                  {/* Footer Section */}
                  <Box sx={{ 
                    mt: 4,
                    textAlign: 'left',
                    mr: 'auto',
                    maxWidth: '80%'
                  }}>
                    <Typography 
                      sx={{ 
                        mb: 2,
                        textAlign: 'left'
                      }}
                    >
                      Thank you for Connecting with us.
                    </Typography>
                    <Typography 
                      sx={{ 
                        mb: 2,
                        textAlign: 'left'
                      }} 
                      variant="body2" 
                      color="text.secondary"
                    >
                      Note: By submitting this KYC form, you acknowledge and agree to abide by the rules of Cohopers Coworking as established in the agreement between your company and 9C Technology Labs Pvt. Ltd.
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        textAlign: 'left'
                      }}
                    >
                      Team Cohopers
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        textAlign: 'left'
                      }}
                    >
                      9C Technology labs Pvt. Ltd.
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBackToCompanyKYC}
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
                      onClick={handleSubmit}
                      sx={{ 
                        bgcolor: '#8BC34A',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#7CB342'
                        }
                      }}
                    >
                      SUBMIT
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Signing Authority KYC Section - Only show if someone else is selected */}
            {signingAuthority === 'someone_else' && (
              <Accordion 
                expanded={expanded === 'panel4' && companyKYCCompleted} 
                onChange={handleAccordionChange('panel4')}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: '#75A5A3',
                    color: 'white',
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: 'white',
                    },
                  }}
                >
                  <Typography variant="h6">SIGNING AUTHORITY KYC</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4, 
                      fontWeight: 500,
                      textAlign: 'left',
                      mr: 'auto',
                      pl: 2
                    }}
                  >
                    Enter Your Details
                  </Typography>
                  
                  <Grid container spacing={4}>
                    {/* Left Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <SigningAuthorityFileUpload 
                          type="authLetter" 
                          label="Authorization Letter from Company"
                          note="(Note: Granting power to signing authority to sign on behalf of company.)*"
                        />
                        <SigningAuthorityFileUpload 
                          type="frontID" 
                          label="Photo ID Card Front Side (Aadhar/Driving License/Voter ID)*" 
                        />
                        <SigningAuthorityFileUpload 
                          type="backID" 
                          label="Photo ID Card Back Side (Aadhar/Driving License/Voter ID)*" 
                        />

                        <TextField
                          fullWidth
                          placeholder="Email-ID (Invoice will be sent)*"
                          variant="outlined"
                          sx={{ 
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white'
                            }
                          }}
                        />

                        <TextField
                          fullWidth
                          placeholder="Mobile Number*"
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white'
                            }
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Right Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3,
                        ml: { xs: 0, md: 8 }
                      }}>
                        <SigningAuthorityFileUpload 
                          type="photo" 
                          label="Signing Authority Photo*" 
                        />
                        <SigningAuthorityFileUpload 
                          type="pan" 
                          label="Signing Authority PAN*" 
                        />

                        {/* KYC Image */}
                        <Box sx={{ mt: 4 }}>
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

                  {/* Footer Section */}
                  <Box sx={{ 
                    mt: 4,
                    textAlign: 'left',
                    mr: 'auto',
                    maxWidth: '80%'
                  }}>
                    <Typography sx={{ mb: 2 }}>Thank you for Connecting with us.</Typography>
                    <Typography sx={{ mb: 2 }} variant="body2" color="text.secondary">
                      Note: By submitting this KYC form, you acknowledge and agree to abide by the rules of Cohopers Coworking as established in the agreement between your company and 9C Technology Labs Pvt. Ltd.
                    </Typography>
                    <Typography variant="body2">Team Cohopers</Typography>
                    <Typography variant="body2">9C Technology labs Pvt. Ltd.</Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBackToCompanyKYC}
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
                      onClick={handleSubmit}
                      sx={{ 
                        bgcolor: '#8BC34A',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#7CB342'
                        }
                      }}
                    >
                      SUBMIT
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </>
        )}

        {/* Freelancer KYC Section */}
        {kycType === 'freelancer' && (
          <Accordion 
            expanded={expanded === 'panel5'} 
            onChange={handleAccordionChange('panel5')}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: '#75A5A3',
                color: 'white',
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: 'white',
                },
              }}
            >
              <Typography variant="h6">FREELANCER KYC</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 500,
                  textAlign: 'left',
                  mr: 'auto',
                  pl: 2
                }}
              >
                Enter Your Details
              </Typography>
              
              <Grid container spacing={4}>
                {/* Left Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Name of member*"
                      variant="outlined"
                      value={freelancerData.name}
                      onChange={(e) => setFreelancerData({...freelancerData, name: e.target.value})}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                    />

                    <FreelancerFileUpload 
                      type="gstin" 
                      label="GSTIN" 
                    />

                    <FreelancerFileUpload 
                      type="frontID" 
                      label="Member Photo ID Card Front Side (Aadhar/Driving License)*" 
                    />

                    <FreelancerFileUpload 
                      type="backID" 
                      label="Member Photo ID Card Back Side (Aadhar/Driving License)*" 
                    />

                    <TextField
                      fullWidth
                      placeholder="Email-ID (Invoice will be sent)*"
                      variant="outlined"
                      value={freelancerData.email}
                      onChange={(e) => setFreelancerData({...freelancerData, email: e.target.value})}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      placeholder="Mobile Number*"
                      variant="outlined"
                      value={freelancerData.mobile}
                      onChange={(e) => setFreelancerData({...freelancerData, mobile: e.target.value})}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Right Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    ml: { xs: 0, md: 8 }
                  }}>

                    <FreelancerFileUpload 
                      type="memberPhoto" 
                      label="Member Photo*"
                      note="(PS: This may be used for Cohopers ID-Card)" 
                    />

                    <FreelancerFileUpload 
                      type="memberPAN" 
                      label="Member PAN*" 
                    />

                    {/* KYC Image */}
                    <Box sx={{ mt: 4 }}>
                      <img 
                        src={FreelancerKYCImage} 
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

              {/* Footer Section */}
              <Box sx={{ 
                mt: 4,
                textAlign: 'left',
                mr: 'auto',
                maxWidth: '80%'
              }}>
                <Typography sx={{ mb: 2 }}>Thank you for Connecting with us.</Typography>
                <Typography sx={{ mb: 2 }} variant="body2" color="text.secondary">
                  Note: By submitting this KYC form, you acknowledge and agree to abide by the rules of Cohopers Coworking as established in the agreement between your company and 9C Technology Labs Pvt. Ltd.
                </Typography>
                <Typography variant="body2">Team Cohopers</Typography>
                <Typography variant="body2">9C Technology labs Pvt. Ltd.</Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToCompanyKYC}
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
                  onClick={handleSubmit}
                  sx={{ 
                    bgcolor: '#8BC34A',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#7CB342'
                    }
                  }}
                >
                  SUBMIT
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default KYCForm; 