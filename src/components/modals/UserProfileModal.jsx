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
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
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

    // Vehicle states
    const [vehicles, setVehicles] = useState([]);
    const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
    const [vehicleFormMode, setVehicleFormMode] = useState('add');
    const [vehicleFormData, setVehicleFormData] = useState({ vehicleNumber: '', vehicleType: '' });
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [vehicleLoading, setVehicleLoading] = useState(false);
    const [vehicleError, setVehicleError] = useState('');

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
            setVehicles(user.vehicles || []);
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
                const responseData = response.data || {};
                const resolvedName =
                    responseData.companyOrFreelancerName ||
                    responseData.name ||
                    responseData.userName ||
                    responseData.username ||
                    profileData.name;
                const resolvedMobile =
                    responseData.phone ||
                    responseData.mobile ||
                    responseData.mobileNumber ||
                    profileData.mobile ||
                    profileData.phone;

                const updatedUserData = {
                    ...user,
                    ...responseData,
                    username: resolvedName,
                    userName: responseData.userName || resolvedName,
                    name: resolvedName,
                    companyOrFreelancerName: responseData.companyOrFreelancerName || resolvedName,
                    mobile: resolvedMobile,
                    phone: responseData.phone || resolvedMobile,
                    profilePhoto: responseData.profilePhoto || profilePhotoPreview || user?.profilePhoto || null
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

    // --- Vehicle handlers ---
    const fetchVehicles = async () => {
        const response = await userService.getVehicles();
        if (response.success) {
            setVehicles(response.data || []);
        }
    };

    const openAddVehicleForm = () => {
        setVehicleFormData({ vehicleNumber: '', vehicleType: '' });
        setVehicleFormMode('add');
        setEditingVehicleId(null);
        setVehicleError('');
        setVehicleFormOpen(true);
    };

    const openEditVehicleForm = (vehicle) => {
        setVehicleFormData({ vehicleNumber: vehicle.vehicleNumber, vehicleType: vehicle.vehicleType });
        setVehicleFormMode('edit');
        setEditingVehicleId(vehicle.id);
        setVehicleError('');
        setVehicleFormOpen(true);
    };

    const closeVehicleForm = () => {
        setVehicleFormOpen(false);
        setVehicleError('');
    };

    const handleVehicleFormSubmit = async () => {
        if (!vehicleFormData.vehicleNumber.trim()) {
            setVehicleError('Vehicle number is required');
            return;
        }
        if (!vehicleFormData.vehicleType) {
            setVehicleError('Vehicle type is required');
            return;
        }
        setVehicleLoading(true);
        setVehicleError('');
        try {
            let response;
            if (vehicleFormMode === 'add') {
                response = await userService.addVehicle(vehicleFormData);
            } else {
                response = await userService.updateVehicle(editingVehicleId, vehicleFormData);
            }
            if (response.success) {
                await fetchVehicles();
                closeVehicleForm();
            } else {
                setVehicleError(response.message || 'Operation failed');
            }
        } catch (err) {
            setVehicleError('An unexpected error occurred');
        } finally {
            setVehicleLoading(false);
        }
    };

    const handleDeleteVehicle = async (id) => {
        setVehicleLoading(true);
        try {
            const response = await userService.deleteVehicle(id);
            if (response.success) {
                await fetchVehicles();
            }
        } catch (err) {
            console.error('Delete vehicle error:', err);
        } finally {
            setVehicleLoading(false);
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

                {/* My Vehicles Section */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    My Vehicles
                </Typography>

                {vehicles.length === 0 && !vehicleFormOpen && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        No vehicles added yet.
                    </Typography>
                )}

                {vehicles.map((vehicle) => (
                    <Box
                        key={vehicle.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            bgcolor: '#fafafa'
                        }}
                    >
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {vehicle.vehicleNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {vehicle.vehicleType}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={() => openEditVehicleForm(vehicle)}
                                disabled={vehicleLoading}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                disabled={vehicleLoading}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                ))}

                {vehicleFormOpen && (
                    <Box sx={{ mt: 1.5, p: 2, border: '1px solid #75A5A3', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            {vehicleFormMode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
                        </Typography>
                        {vehicleError && (
                            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setVehicleError('')}>
                                {vehicleError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                            <TextField
                                label="Vehicle Number"
                                value={vehicleFormData.vehicleNumber}
                                onChange={(e) => setVehicleFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                size="small"
                                sx={{ flex: 1, minWidth: 130 }}
                            />
                            <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
                                <InputLabel>Vehicle Type</InputLabel>
                                <Select
                                    value={vehicleFormData.vehicleType}
                                    onChange={(e) => setVehicleFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                                    label="Vehicle Type"
                                >
                                    <MenuItem value="Car">Car</MenuItem>
                                    <MenuItem value="Bike">Bike</MenuItem>
                                    <MenuItem value="Scooty">Scooty</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleVehicleFormSubmit}
                                disabled={vehicleLoading}
                                sx={{ bgcolor: '#75A5A3', '&:hover': { bgcolor: '#638e8c' } }}
                            >
                                {vehicleLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={closeVehicleForm}
                                disabled={vehicleLoading}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}

                {!vehicleFormOpen && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={openAddVehicleForm}
                        disabled={vehicleLoading}
                        sx={{
                            mt: 1,
                            color: '#75A5A3',
                            borderColor: '#75A5A3',
                            '&:hover': { borderColor: '#638e8c', bgcolor: 'rgba(117,165,163,0.04)' }
                        }}
                    >
                        + Add Vehicle
                    </Button>
                )}
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
