import axios from 'axios';

// Base URL for the API
const BASE_URL = 'https://api.boldtribe.in';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
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
            console.log('Login request data:', { mobileNumber, password });
            
            // Try different field names that the API might expect
            const loginData = {
                mobileNumber,
                password,
                mobile: mobileNumber,  // Alternative field name
                phone: mobileNumber    // Another alternative
            };
            
            console.log('Sending login data:', loginData);
            
            const response = await apiClient.post('/api/user/login', loginData);

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

    // Logout function
    async logout() {
        try {
            // Call logout endpoint if available
            await apiClient.post('/api/user/logout');
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
            const response = await apiClient.get('/api/user/verify');
            return response.data;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    },

    // Get user profile
    async getProfile() {
        try {
            const response = await apiClient.get('/api/user/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
};

export default authService;
