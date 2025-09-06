import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp for cache busting
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'An error occurred');
      }
      
      return Promise.reject(data || error.response);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default apiClient;
