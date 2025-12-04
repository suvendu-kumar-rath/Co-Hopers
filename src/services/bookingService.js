import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Base URL for the API from environment configuration
const BASE_URL = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in/api';

// Debug logging for API configuration
if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('Booking Service Configuration:', {
        BASE_URL,
        API_TIMEOUT: ENV_CONFIG.API_TIMEOUT,
        NODE_ENV: ENV_CONFIG.NODE_ENV
    });
}

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: ENV_CONFIG.API_TIMEOUT || 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear auth data
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            window.location.reload(); // Refresh to update auth state
        }
        return Promise.reject(error);
    }
);

/**
 * Booking Service - Handles all space booking related API calls
 */
export const bookingService = {
    /**
     * Book a space
     * @param {Object} bookingData - Booking form data
     * @returns {Promise} - API response
     */
    async bookSpace(bookingData) {
        try {
            console.log('Booking space with data:', bookingData);
            
            // Prepare booking data with the exact structure expected by API
            const payload = {
                spaceId: bookingData.spaceId,
                date: bookingData.date,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                amount: bookingData.amount
            };
            
            console.log('Sending booking data to:', `${BASE_URL}/booking/book/space`);
            console.log('Booking payload:', payload);
            
            const response = await apiClient.post('/booking/book/space', payload);
            
            console.log('Booking response:', response.data);
            
            // Handle the response structure you specified
            if (response.data && response.data.message && response.data.booking) {
                return {
                    success: true,
                    data: {
                        booking: response.data.booking,
                        id: response.data.booking.id
                    },
                    message: response.data.message || 'Booking created successfully'
                };
            } else if (response.data && response.data.success) {
                // Fallback for different response structure
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Space booked successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Space booking failed'
                };
            }
        } catch (error) {
            console.error('Space booking error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Invalid booking data or request format';
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            if (error.response?.status === 500) {
                const errorMessage = error.response.data?.error || 
                                   error.response.data?.message || 
                                   'Internal server error during booking creation';
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Get user's booking history
     * @param {number} userId - User ID
     * @returns {Promise} - API response
     */
    async getUserBookings(userId) {
        try {
            console.log('Getting bookings for user:', userId);
            
            const response = await apiClient.get(`/booking/user/${userId}`);
            
            console.log('User bookings response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to get user bookings'
                };
            }
        } catch (error) {
            console.error('Get user bookings error:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Get booking status
     * @param {string} bookingId - Booking ID
     * @returns {Promise} - API response
     */
    async getBookingStatus(bookingId) {
        try {
            console.log('Getting booking status for:', bookingId);
            
            const response = await apiClient.get(`/booking/status/${bookingId}`);
            
            console.log('Booking status response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to get booking status'
                };
            }
        } catch (error) {
            console.error('Get booking status error:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Cancel a booking
     * @param {string} bookingId - Booking ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise} - API response
     */
    async cancelBooking(bookingId, reason) {
        try {
            console.log('Cancelling booking:', bookingId, 'Reason:', reason);
            
            const payload = {
                bookingId,
                reason,
                cancelledAt: new Date().toISOString()
            };
            
            const response = await apiClient.post(`/booking/cancel/${bookingId}`, payload);
            
            console.log('Cancel booking response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Booking cancelled successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Booking cancellation failed'
                };
            }
        } catch (error) {
            console.error('Cancel booking error:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Update booking details
     * @param {string} bookingId - Booking ID
     * @param {Object} updateData - Updated booking data
     * @returns {Promise} - API response
     */
    async updateBooking(bookingId, updateData) {
        try {
            console.log('Updating booking:', bookingId, 'with data:', updateData);
            
            const payload = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            const response = await apiClient.put(`/booking/update/${bookingId}`, payload);
            
            console.log('Update booking response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Booking updated successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Booking update failed'
                };
            }
        } catch (error) {
            console.error('Update booking error:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Submit KYC data for a booking
     * @param {string} bookingId - Booking ID
     * @param {Object} kycData - KYC form data
     * @returns {Promise} - API response
     */
    async submitKYC(bookingId, kycData) {
        try {
            console.log('Submitting KYC for booking:', bookingId, 'with data:', kycData);
            
            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            console.log('kycData', kycData);
            
            // Handle different KYC types
            if (kycData.kycType === 'freelancer') {
                // Freelancer KYC fields - use form data if available, otherwise fallback to user data
                formData.append('type', 'freelancer');
                formData.append('name', kycData.freelancerData?.name || kycData.userName || '');
                formData.append('email', kycData.freelancerData?.email || kycData.userEmail || '');
                formData.append('mobile', kycData.freelancerData?.mobile || kycData.user?.mobile || kycData.user?.phone || kycData.user?.mobileNumber || '');
                
                // Freelancer files
                if (kycData.freelancerFiles?.idFront?.file) {
                    formData.append('idFront', kycData.freelancerFiles.idFront.file);
                }
                if (kycData.freelancerFiles?.idBack?.file) {
                    formData.append('idBack', kycData.freelancerFiles.idBack.file);
                }
                if (kycData.freelancerFiles?.pan?.file) {
                    formData.append('pan', kycData.freelancerFiles.pan.file);
                }
                if (kycData.freelancerFiles?.photo?.file) {
                    formData.append('photo', kycData.freelancerFiles.photo.file);
                }
                if (kycData.freelancerFiles?.paymentScreenshot?.file) {
                    formData.append('paymentScreenshot', kycData.freelancerFiles.paymentScreenshot.file);
                }
                
            } else if (kycData.kycType === 'company') {
                // Company KYC fields
                formData.append('type', 'company');
                formData.append('name', kycData.companyData?.directorName || kycData.userName || '');
                formData.append('email', kycData.companyData?.email || kycData.userEmail || '');
                formData.append('mobile', kycData.companyData?.mobile || kycData.user?.mobile || kycData.user?.phone || kycData.user?.mobileNumber || '');
                formData.append('companyName', kycData.companyData?.companyName || '');
                formData.append('gstNumber', kycData.companyData?.gstNumber || '');
                formData.append('directorName', kycData.companyData?.directorName || '');
                formData.append('din', kycData.companyData?.din || '');
                
                // Company files
                if (kycData.uploadedFiles?.certificateOfIncorporation?.file) {
                    formData.append('certificateOfIncorporation', kycData.uploadedFiles.certificateOfIncorporation.file);
                }
                if (kycData.uploadedFiles?.companyPAN?.file) {
                    formData.append('companyPAN', kycData.uploadedFiles.companyPAN.file);
                }
                
                // Director files (if director is signing authority)
                if (kycData.signingAuthority === 'director' && kycData.directorFiles) {
                    if (kycData.directorFiles?.directorPAN?.file) {
                        formData.append('directorPAN', kycData.directorFiles.directorPAN.file);
                    }
                    if (kycData.directorFiles?.directorPhoto?.file) {
                        formData.append('directorPhoto', kycData.directorFiles.directorPhoto.file);
                    }
                    if (kycData.directorFiles?.directorIdFront?.file) {
                        formData.append('directorIdFront', kycData.directorFiles.directorIdFront.file);
                    }
                    if (kycData.directorFiles?.directorIdBack?.file) {
                        formData.append('directorIdBack', kycData.directorFiles.directorIdBack.file);
                    }
                    if (kycData.directorFiles?.directorPaymentProof?.file) {
                        formData.append('directorPaymentProof', kycData.directorFiles.directorPaymentProof.file);
                    }
                }
                
                // Signing Authority files (if signing authority is someone else)
                if (kycData.signingAuthority === 'signing-authority' && kycData.signingAuthorityFiles) {
                    // Add signing authority specific files if needed
                    // You may need to map these based on your form structure
                }
            }
            
            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            
            const response = await apiClient.post(`/booking/kyc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('KYC submission response:', response);
            
            if (response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.data.message || 'KYC submitted successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'KYC submission failed'
                };
            }
        } catch (error) {
            console.error('KYC submission error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Invalid KYC data or request format';
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Submit KYC data without booking (for meeting room registrations)
     * @param {Object} kycData - KYC form data
     * @returns {Promise} - API response
     */
    async submitKYCOnly(kycData) {
        try {
            console.log('Submitting KYC only (no booking) with data:', kycData);
            
            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            
            // Handle different KYC types
            if (kycData.kycType === 'freelancer') {
                // Freelancer KYC fields
                formData.append('type', 'freelancer');
                formData.append('name', kycData.freelancerData?.name || kycData.userName || '');
                formData.append('email', kycData.freelancerData?.email || kycData.userEmail || '');
                formData.append('mobile', kycData.freelancerData?.mobile || kycData.user?.mobile || kycData.user?.phone || kycData.user?.mobileNumber || '');
                
                // Freelancer files
                if (kycData.freelancerFiles?.idFront?.file) {
                    formData.append('idFront', kycData.freelancerFiles.idFront.file);
                }
                if (kycData.freelancerFiles?.idBack?.file) {
                    formData.append('idBack', kycData.freelancerFiles.idBack.file);
                }
                if (kycData.freelancerFiles?.pan?.file) {
                    formData.append('pan', kycData.freelancerFiles.pan.file);
                }
                if (kycData.freelancerFiles?.photo?.file) {
                    formData.append('photo', kycData.freelancerFiles.photo.file);
                }
                
            } else if (kycData.kycType === 'company') {
                // Company KYC fields
                formData.append('type', 'company');
                formData.append('name', kycData.companyData?.directorName || kycData.userName || '');
                formData.append('email', kycData.companyData?.email || kycData.userEmail || '');
                formData.append('mobile', kycData.companyData?.mobile || kycData.user?.mobile || kycData.user?.phone || kycData.user?.mobileNumber || '');
                formData.append('companyName', kycData.companyData?.companyName || '');
                formData.append('gstNumber', kycData.companyData?.gstNumber || '');
                formData.append('directorName', kycData.companyData?.directorName || '');
                formData.append('din', kycData.companyData?.din || '');
                
                // Company files
                if (kycData.uploadedFiles?.certificateOfIncorporation?.file) {
                    formData.append('certificateOfIncorporation', kycData.uploadedFiles.certificateOfIncorporation.file);
                }
                if (kycData.uploadedFiles?.companyPAN?.file) {
                    formData.append('companyPAN', kycData.uploadedFiles.companyPAN.file);
                }
                
                // Director files (if director is signing authority)
                if (kycData.signingAuthority === 'director' && kycData.directorFiles) {
                    if (kycData.directorFiles?.directorPAN?.file) {
                        formData.append('directorPAN', kycData.directorFiles.directorPAN.file);
                    }
                    if (kycData.directorFiles?.directorPhoto?.file) {
                        formData.append('directorPhoto', kycData.directorFiles.directorPhoto.file);
                    }
                    if (kycData.directorFiles?.directorIdFront?.file) {
                        formData.append('directorIdFront', kycData.directorFiles.directorIdFront.file);
                    }
                    if (kycData.directorFiles?.directorIdBack?.file) {
                        formData.append('directorIdBack', kycData.directorFiles.directorIdBack.file);
                    }
                }
            }
            
            // Log FormData contents for debugging
            console.log('FormData contents (KYC only):');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            
            // Submit to a separate endpoint for KYC-only submissions
            const response = await apiClient.post(`/booking/kyc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('KYC-only submission response:', response.data);
            
            if (response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.data.message || 'KYC submitted successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'KYC submission failed'
                };
            }
        } catch (error) {
            console.error('KYC-only submission error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Invalid KYC data or request format';
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Submit payment screenshot for a booking
     * @param {string} bookingId - Booking ID
     * @param {Object} paymentData - Payment data including screenshot
     * @returns {Promise} - API response
     */
    async submitPayment(bookingId, paymentData) {
        try {
            console.log('Submitting payment for booking:', bookingId);
            
            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            
            // Add payment method
            if (paymentData.paymentMethod) {
                formData.append('paymentMethod', paymentData.paymentMethod);
            }
            
            // Add payment screenshot file
            if (paymentData.paymentScreenshot) {
                formData.append('paymentScreenshot', paymentData.paymentScreenshot);
            }
            
            // Add any additional payment details
            if (paymentData.amount) {
                formData.append('amount', paymentData.amount);
            }
            
            if (paymentData.transactionId) {
                formData.append('transactionId', paymentData.transactionId);
            }
            
            // Log FormData contents for debugging
            console.log('Payment FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            
            const response = await apiClient.post(`/booking/${bookingId}/payment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Payment submission response:', response.data);
            
            // Handle the response format: { message, booking: {...} }
            if (response.data && response.data.message) {
                return {
                    success: true,
                    data: {
                        message: response.data.message,
                        booking: response.data.booking
                    },
                    message: response.data.message
                };
            } else if (response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.data.message || 'Payment submitted successfully'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Payment submission failed'
                };
            }
        } catch (error) {
            console.error('Payment submission error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: error.config
            });
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   'Invalid payment data or request format';
                return {
                    success: false,
                    message: errorMessage
                };
            }
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }
            
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    }
};

export default bookingService;