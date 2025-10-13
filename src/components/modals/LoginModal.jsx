import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    Fade,
    Divider,
    Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
    const { login } = useAuth();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobile = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const validateForm = () => {
        if (isRegisterMode) {
            if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all fields');
                return false;
            }
            
            if (!validateEmail(formData.email)) {
                setError('Please enter a valid email address');
                return false;
            }
            
            if (!validateMobile(formData.mobileNumber)) {
                setError('Please enter a valid 10-digit mobile number');
                return false;
            }
            
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return false;
            }
            
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        } else {
            if (!formData.mobileNumber || !formData.password) {
                setError('Please fill in all fields');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            let result;
            
            if (isRegisterMode) {
                result = await authService.register({
                    name: formData.name,
                    email: formData.email,
                    mobileNumber: formData.mobileNumber,
                    password: formData.password
                });
            } else {
                result = await authService.login(formData.mobileNumber, formData.password);
            }
            
            if (result.success) {
                // Update auth context
                login(result.data, result.token);
                
                // Reset form
                setFormData({ 
                    name: '',
                    email: '',
                    mobileNumber: '', 
                    password: '',
                    confirmPassword: ''
                });
                
                // Call success callback
                if (onLoginSuccess) {
                    onLoginSuccess(result.data);
                }
            } else {
                setError(result.message || (isRegisterMode ? 'Registration failed' : 'Login failed'));
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error(isRegisterMode ? 'Registration error:' : 'Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ 
            name: '',
            email: '',
            mobileNumber: '', 
            password: '',
            confirmPassword: ''
        });
        setError('');
        setLoading(false);
        setIsRegisterMode(false);
        onClose();
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setFormData({ 
            name: '',
            email: '',
            mobileNumber: '', 
            password: '',
            confirmPassword: ''
        });
        setError('');
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: isRegisterMode ? 450 : 400,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        p: 4,
                        outline: 'none',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&:hover': {
                                color: 'rgba(0, 0, 0, 0.8)',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Header */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            {isRegisterMode ? <PersonIcon sx={{ mr: 1, color: '#3b82f6' }} /> : <LoginIcon sx={{ mr: 1, color: '#3b82f6' }} />}
                            <Typography
                                variant="h4"
                                sx={{
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    fontWeight: 700
                                }}
                            >
                                {isRegisterMode ? 'Create Account' : 'Member Login'}
                            </Typography>
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontSize: '1rem'
                            }}
                        >
                            {isRegisterMode 
                                ? 'Join us to book your perfect workspace' 
                                : 'Please login to continue with your booking'
                            }
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                borderRadius: 2,
                                '& .MuiAlert-message': {
                                    fontSize: '0.9rem'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {isRegisterMode && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    required
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1d4ed8'
                                            }
                                        }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    required
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1d4ed8'
                                            }
                                        }
                                    }}
                                />
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Mobile Number"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            type="tel"
                            placeholder="10-digit mobile number"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover fieldset': {
                                        borderColor: '#3b82f6'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1d4ed8'
                                    }
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            helperText={isRegisterMode ? "Minimum 6 characters" : ""}
                            sx={{
                                mb: isRegisterMode ? 2 : 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover fieldset': {
                                        borderColor: '#3b82f6'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1d4ed8'
                                    }
                                }
                            }}
                        />

                        {isRegisterMode && (
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                margin="normal"
                                required
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover fieldset': {
                                            borderColor: '#3b82f6'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1d4ed8'
                                        }
                                    }
                                }}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                mb: 2,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)'
                                },
                                '&:disabled': {
                                    background: 'rgba(0, 0, 0, 0.12)',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                isRegisterMode ? 'Create Account' : 'Login'
                            )}
                        </Button>
                    </form>

                    {/* Mode Toggle */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'rgba(0, 0, 0, 0.6)' }}>
                            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                        </Typography>
                        <Link
                            component="button"
                            type="button"
                            onClick={toggleMode}
                            sx={{
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                '&:hover': {
                                    color: '#1d4ed8',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {isRegisterMode ? 'Login here' : 'Register here'}
                        </Link>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default LoginModal;
