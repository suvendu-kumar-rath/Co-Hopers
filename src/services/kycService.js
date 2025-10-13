import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Base URL for the API from environment configuration
const BASE_URL = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in/api';

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
 * KYC Service - Handles all KYC related API calls for booking
 */
export const kycService = {
    /**
     * Submit KYC data for booking payment
     * @param {number} userId - User ID
     * @param {Object} kycData - KYC form data
     * @param {string} userType - 'company' or 'freelancer'
     * @returns {Promise} - API response
     */
    async submitBookingKYC(userId, kycData, userType) {
        try {
            console.log('Submitting KYC data for booking:', { userId, userType, kycData });
            
            // Prepare KYC data based on user type
            const payload = {
                userId,
                userType,
                ...kycData
            };
            
            console.log('Sending KYC data to:', `${BASE_URL}/booking/kyc/${userId}`);
            console.log('KYC payload:', payload);
            
            const response = await apiClient.post(`/booking/kyc/${userId}`, payload);
            
            console.log('KYC response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
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
     * Get KYC status for a booking
     * @param {number} userId - User ID
     * @returns {Promise} - API response
     */
    async getKYCStatus(userId) {
        try {
            console.log('Getting KYC status for user:', userId);
            
            const response = await apiClient.get(`/booking/kyc/${userId}/status`);
            
            console.log('KYC status response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to get KYC status'
                };
            }
        } catch (error) {
            console.error('Get KYC status error:', error);
            
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
     * Update KYC data for booking
     * @param {number} userId - User ID
     * @param {Object} kycData - Updated KYC data
     * @returns {Promise} - API response
     */
    async updateKYC(userId, kycData) {
        try {
            console.log('Updating KYC data for user:', userId);
            
            const response = await apiClient.put(`/booking/kyc/${userId}`, kycData);
            
            console.log('Update KYC response:', response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'KYC update failed'
                };
            }
        } catch (error) {
            console.error('Update KYC error:', error);
            
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

export default kycService;
