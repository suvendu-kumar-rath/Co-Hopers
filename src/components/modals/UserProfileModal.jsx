import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Avatar,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const UserProfileModal = ({ open, onClose }) => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: '',
        phone: '',
        companyOrFreelancerName: '',
        teamSize: 0,
        type: '',
        profilePhoto: null
    });
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load profile data when modal opens
    useEffect(() => {
        if (open && user) {
            // Load from user context first
            setProfileData({
                name: user.companyOrFreelancerName || user.username || user.name || '',
                email: user.email || '',
                mobile: user.phone || user.mobile || '',
                phone: user.phone || user.mobile || '',
                companyOrFreelancerName: user.companyOrFreelancerName || '',
                teamSize: user.teamSize || 0,
                type: user.type || '',
                profilePhoto: user.profilePhoto || null
            });
            setProfilePhotoPreview(user.profilePhoto || null);
        }
    }, [open, user]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setProfilePhotoFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset data
            setProfileData({
                name: user.companyOrFreelancerName || user.username || user.name || '',
                email: user.email || '',
                mobile: user.phone || user.mobile || '',
                phone: user.phone || user.mobile || '',
                companyOrFreelancerName: user.companyOrFreelancerName || '',
                teamSize: user.teamSize || 0,
                type: user.type || '',
                profilePhoto: user.profilePhoto || null
            });
            setProfilePhotoPreview(user.profilePhoto || null);
            setProfilePhotoFile(null);
            setError('');
            setSuccess('');
        }
        setIsEditing(!isEditing);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare data for API
            const updateData = {
                name: profileData.name || profileData.companyOrFreelancerName,
                email: profileData.email,
                mobile: profileData.mobile || profileData.phone
            };

            // Add photo if changed
            if (profilePhotoFile) {
                updateData.profilePhoto = profilePhotoFile;
            }

            // Call API
            const response = await userService.updateUserProfile(updateData);

            if (response.success) {
                setSuccess('Profile updated successfully!');
                
                // Update user context
                const updatedUserData = {
                    ...user,
                    ...response.data,
                    username: response.data.companyOrFreelancerName || response.data.name,
                    name: response.data.companyOrFreelancerName || response.data.name,
                    mobile: response.data.phone || response.data.mobile
                };
                
                updateUser(updatedUserData);
                
                setIsEditing(false);
                
                // Close modal after a short delay
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Profile update error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setIsEditing(false);
            setError('');
            setSuccess('');
            setProfilePhotoFile(null);
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        User Profile
                    </Typography>
                    <IconButton 
                        onClick={handleClose} 
                        disabled={loading}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                {/* Profile Photo Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={profilePhotoPreview}
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: '#2196f3',
                                fontSize: '3rem',
                                border: '4px solid #f5f5f5',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            {!profilePhotoPreview && (profileData.name?.charAt(0)?.toUpperCase() || 'U')}
                        </Avatar>
                        {isEditing && (
                            <IconButton
                                component="label"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: '#2196f3',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#1976d2' },
                                    boxShadow: 2
                                }}
                                size="small"
                            >
                                <PhotoCameraIcon fontSize="small" />
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </IconButton>
                        )}
                    </Box>
                    {profileData.type && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                mt: 1, 
                                px: 2, 
                                py: 0.5, 
                                bgcolor: '#e3f2fd', 
                                color: '#1976d2',
                                borderRadius: 1,
                                fontWeight: 500
                            }}
                        >
                            {profileData.type}
                            {profileData.teamSize > 0 && ` • Team Size: ${profileData.teamSize}`}
                        </Typography>
                    )}
                </Box>

                {/* Error/Success Messages */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {/* Form Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Name / Company Name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={!isEditing || loading}
                        variant="outlined"
                    />

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={!isEditing || loading}
                        variant="outlined"
                    />

                    <TextField
                        label="Mobile Number"
                        name="mobile"
                        value={profileData.mobile}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={!isEditing || loading}
                        variant="outlined"
                    />
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2 }}>
                {!isEditing ? (
                    <>
                        <Button 
                            onClick={handleClose}
                            variant="outlined"
                        >
                            Close
                        </Button>
                        <Button 
                            onClick={handleEditToggle}
                            variant="contained"
                            startIcon={<EditIcon />}
                        >
                            Edit Profile
                        </Button>
                    </>
                ) : (
                    <>
                        <Button 
                            onClick={handleEditToggle}
                            variant="outlined"
                            disabled={loading}
                            startIcon={<CancelIcon />}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UserProfileModal;
