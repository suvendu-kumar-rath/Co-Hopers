import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Base URL for the API from environment configuration
const BASE_URL = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in';

// Debug logging for API configuration
if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('Auth Service Configuration:', {
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

// Auth service functions
export const authService = {
    // Login function
    async login(mobileNumber, password) {
        try {
            console.log('Login request data:', { mobileNumber, password: '***' });
            
            // Prepare login data according to API requirements
            const loginData = {
                mobileNumber,
                password,
                mobile: mobileNumber,  // Alternative field name
                phone: mobileNumber    // Another alternative
            };
            
            console.log('Sending login data to:', `${BASE_URL}/user/login`);
            console.log('Login payload:', { ...loginData, password: '***' });
            
            const response = await apiClient.post('/user/login', loginData);

            console.log('Login response:', response.data);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    token: response.data.token || response.data.data?.token,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error details:', {
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
                                   'Invalid credentials or request format';
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

    // Register function
    async register(userData) {
        try {
            console.log('Register request data:', userData);
            
            // Prepare registration data according to backend requirements
            const registerData = {
                userName: userData.name,
                email: userData.email,
                mobile: userData.mobileNumber,
                password: userData.password,
                confirmPassword: userData.confirmPassword || userData.password
            };
            
            console.log('Sending register data to:', `${BASE_URL}/user/register`);
            console.log('Register payload:', registerData);
            
            const response = await apiClient.post('/user/register', registerData);

            console.log('Register response:', response.data);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    token: response.data.token || response.data.data?.token,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Register error details:', {
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
                                   'Invalid registration data or user already exists';
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

    // Logout function
    async logout() {
        try {
            // Call logout endpoint if available
            await apiClient.post('/user/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API call result
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
        }
    },

    // Verify token
    async verifyToken() {
        try {
            const response = await apiClient.get('/user/verify');
            return response.data;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    },

    // Get user profile
    async getProfile() {
        try {
            const response = await apiClient.get('/user/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
};

export default authService;
