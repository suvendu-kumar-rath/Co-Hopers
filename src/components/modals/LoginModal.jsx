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
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        mobileNumber: '',
        password: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.mobileNumber || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await authService.login(formData.mobileNumber, formData.password);
            
            if (result.success) {
                // Update auth context
                login(result.data, result.token);
                
                // Reset form
                setFormData({ mobileNumber: '', password: '' });
                
                // Call success callback
                if (onLoginSuccess) {
                    onLoginSuccess(result.data);
                }
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ mobileNumber: '', password: '' });
        setError('');
        setLoading(false);
        onClose();
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
                        maxWidth: 400,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        p: 4,
                        outline: 'none'
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
                        <Typography
                            variant="h4"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontWeight: 700,
                                mb: 1
                            }}
                        >
                            Member Login
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontSize: '1rem'
                            }}
                        >
                            Please login to continue with your booking
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Mobile Number"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            type="tel"
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
                                'Login'
                            )}
                        </Button>
                    </form>
                </Box>
            </Fade>
        </Modal>
    );
};

export default LoginModal;
