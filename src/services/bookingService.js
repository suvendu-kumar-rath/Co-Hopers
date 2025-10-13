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
            
            const response = await apiClient.post(`/booking/kyc/${bookingId}`, kycData);
            
            console.log('KYC submission response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
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
    }
};

export default bookingService;