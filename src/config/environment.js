// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'test';

export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  IS_TESTING: isTesting,
  
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  
  // App Configuration
  APP_NAME: process.env.REACT_APP_NAME || 'Co-Hopers',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_LOGS: isDevelopment || process.env.REACT_APP_DEBUG_LOGS === 'true',
  
  // External Services
  WHATSAPP_NUMBER: process.env.REACT_APP_WHATSAPP_NUMBER || '+919778708100',
  SUPPORT_EMAIL: process.env.REACT_APP_SUPPORT_EMAIL || 'support@cohopers.com',
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ],
  
  // Google Analytics (if needed)
  GA_TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID || '',
  
  // Sentry Error Tracking (if needed)
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || '',
};

// Log configuration in development
if (isDevelopment && ENV_CONFIG.ENABLE_DEBUG_LOGS) {
  console.log('Environment Configuration:', ENV_CONFIG);
}

export default ENV_CONFIG;
