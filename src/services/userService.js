import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Base URL for the API from environment configuration
const BASE_URL = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: ENV_CONFIG.API_TIMEOUT || 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
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
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.reload(); // Refresh to update auth state
        }
        return Promise.reject(error);
    }
);

// Normalize user payload from different API response shapes/field names.
const normalizeUserPayload = (apiData = {}) => {
    const raw = apiData?.user || apiData?.profile || apiData?.data || apiData || {};
    const resolvedName =
        raw.companyOrFreelancerName || raw.name || raw.userName || raw.username || '';
    const resolvedMobile = raw.phone || raw.mobile || raw.mobileNumber || '';
    const resolvedMemberType =
        raw.memberType || apiData?.memberType || apiData?.membershipType || apiData?.membership || null;
    const resolvedKycRequired =
        raw.kycRequired ?? apiData?.kycRequired ?? apiData?.kyc_required ?? null;

    return {
        ...raw,
        memberType: resolvedMemberType,
        kycRequired: resolvedKycRequired,
        username: raw.username || resolvedName,
        userName: raw.userName || resolvedName,
        name: raw.name || resolvedName,
        companyOrFreelancerName: raw.companyOrFreelancerName || resolvedName,
        mobile: resolvedMobile,
        phone: raw.phone || resolvedMobile,
        profilePhoto: raw.profilePhoto || raw.avatar || raw.image || null,
    };
};

/**
 * Get user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
    try {
        const response = await apiClient.get('/user/profile');
        
        if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('[UserService] Profile fetched:', response.data);
        }
        
        const normalizedUser = normalizeUserPayload(response.data.data);

        return {
            success: true,
            data: normalizedUser,
            message: response.data.message
        };
    } catch (error) {
        console.error('[UserService] Error fetching profile:', error);
        
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch profile',
            error: error.response?.data || error.message
        };
    }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {File} profileData.profilePhoto - Profile photo file (optional)
 * @param {string} profileData.name - User name
 * @param {string} profileData.email - User email
 * @param {string} profileData.mobile - User mobile number
 * @returns {Promise} Updated profile data
 */
export const updateUserProfile = async (profileData) => {
    try {
        // Create FormData for multipart/form-data
        const formData = new FormData();
        
        // Append profile photo if provided
        if (profileData.profilePhoto && profileData.profilePhoto instanceof File) {
            formData.append('profilePhoto', profileData.profilePhoto);
        }
        
        // Append other fields
        if (profileData.name) {
            formData.append('name', profileData.name);
        }
        if (profileData.email) {
            formData.append('email', profileData.email);
        }
        if (profileData.mobile) {
            formData.append('mobile', profileData.mobile);
        }
        
        if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('[UserService] Updating profile with data:', {
                name: profileData.name,
                email: profileData.email,
                mobile: profileData.mobile,
                hasPhoto: !!profileData.profilePhoto
            });
        }
        
        const response = await apiClient.put('/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('[UserService] Profile updated:', response.data);
        }
        
        const normalizedUser = normalizeUserPayload(response.data.data);

        return {
            success: true,
            data: normalizedUser,
            message: response.data.message || 'Profile updated successfully'
        };
    } catch (error) {
        console.error('[UserService] Error updating profile:', error);
        
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update profile',
            error: error.response?.data || error.message
        };
    }
};

/**
 * Get user history (meeting rooms, spaces, payments)
 * @param {Object} params - Optional query params (page, limit)
 * @returns {Promise} User history data
 */
export const getUserHistory = async (params = {}) => {
    try {
        const response = await apiClient.get('/user/history', {
            params
        });

        if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
            console.log('[UserService] History fetched:', response.data);
        }

        return {
            success: true,
            data: response.data.data,
            message: response.data.message
        };
    } catch (error) {
        console.error('[UserService] Error fetching history:', error);

        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch history',
            error: error.response?.data || error.message
        };
    }
};

/**
 * Export all user-related services
 */
const userService = {
    getUserProfile,
    updateUserProfile,
    getUserHistory
};

export default userService;
