import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';
import { getImageUrl } from '../utils/helpers/imageUtils';

// Base URL for the API from environment configuration
const BASE_URL = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in/api';

// Debug logging for API configuration
if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('Spaces Service Configuration:', {
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
        'Accept': 'application/json'
    },
});

// Request interceptor to add auth token if available
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
        }
        return Promise.reject(error);
    }
);

/**
 * Spaces Service - Handles all spaces related API calls
 */
class SpacesService {
  /**
   * Get all available spaces from the API
   * @returns {Promise} - API response with spaces data
   */
  async getSpaces() {
    try {
      console.log('Fetching spaces from API...');
      console.log('API URL:', `${BASE_URL}/spaces/spaces`);
      
      const response = await apiClient.get('/spaces/spaces');

      console.log('Spaces API Response:', response.data);
      
      if (response.status === 200) {
        // Process the response data to format image URLs correctly
        const processedData = response.data;
        
        // If the response has a data array, process each space's image URL
        if (processedData && processedData.data && Array.isArray(processedData.data)) {
          processedData.data = processedData.data.map(space => {
            // Extract first image from images array if available
            const imageUrl = space.images && space.images.length > 0 
              ? getImageUrl(space.images[0]) 
              : (space.image ? getImageUrl(space.image) : null);
            
            return {
              ...space,
              image: imageUrl,
              imagePath: imageUrl,
              image_url: imageUrl,
              imageUrl: imageUrl
            };
          });
        } else if (Array.isArray(processedData)) {
          // If response is directly an array of spaces
          return processedData.map(space => {
            // Extract first image from images array if available
            const imageUrl = space.images && space.images.length > 0 
              ? getImageUrl(space.images[0]) 
              : (space.image ? getImageUrl(space.image) : null);
            
            return {
              ...space,
              image: imageUrl,
              imagePath: imageUrl,
              image_url: imageUrl,
              imageUrl: imageUrl
            };
          });
        }
        
        return processedData;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching spaces:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${BASE_URL}/spaces/spaces`
      });
      throw error;
    }
  }

  /**
   * Get space details by ID - Used when user clicks "Book Now"
   * @param {string} spaceId - Space ID (e.g., 25)
   * @returns {Promise} - API response with space details
   */
  async getSpaceById(spaceId) {
    try {
      console.log(`Fetching space details for ID: ${spaceId}`);
      console.log('API URL:', `${BASE_URL}/spaces/spaces/${spaceId}`);
      
      const response = await apiClient.get(`/spaces/spaces/${spaceId}`);

      console.log('Space details API Response:', response.data);
      
      if (response.status === 200) {
        // Handle the actual API response structure
        if (response.data && response.data.success) {
          // Process image URLs in the space data
          const spaceData = response.data.data;
          if (spaceData) {
            // Extract first image from images array if available
            const imageUrl = spaceData.images && spaceData.images.length > 0 
              ? getImageUrl(spaceData.images[0]) 
              : (spaceData.image ? getImageUrl(spaceData.image) : null);
            
            spaceData.image = imageUrl;
            spaceData.imagePath = imageUrl;
            spaceData.image_url = imageUrl;
            spaceData.imageUrl = imageUrl;
          }
          
          return {
            success: response.data.success,
            data: spaceData,
            message: response.data.message
          };
        } else if (response.data) {
          // Handle cases where response.data exists but doesn't have success field
          // Process image URLs
          const spaceData = response.data;
          
          // Extract first image from images array if available
          const imageUrl = spaceData.images && spaceData.images.length > 0 
            ? getImageUrl(spaceData.images[0]) 
            : (spaceData.image ? getImageUrl(spaceData.image) : null);
          
          spaceData.image = imageUrl;
          spaceData.imagePath = imageUrl;
          spaceData.image_url = imageUrl;
          spaceData.imageUrl = imageUrl;
          
          return {
            success: true,
            data: spaceData,
            message: 'Space details retrieved'
          };
        } else {
          throw new Error('No data received from API');
        }
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching space details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        spaceId: spaceId,
        url: `${BASE_URL}/spaces/spaces/${spaceId}`
      });
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: `Space with ID ${spaceId} not found`
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
        message: error.message || 'Failed to fetch space details'
      };
    }
  }

  /**
   * Get space details for booking (handles actual API response structure)
   * @param {string} spaceId - Space ID
   * @returns {Promise} - API response with space booking details
   */
  async getSpaceForBooking(spaceId) {
    try {
      console.log(`Getting space details for booking - Space ID: ${spaceId}`);
      
      const result = await this.getSpaceById(spaceId);
      
      if (result.success) {
        // Transform actual API data structure for booking UI
        const spaceData = result.data;
        
        // Parse and clean available dates
        const availableDates = this.parseAvailableDates(spaceData.availableDates || []);
        
        return {
          success: true,
          data: {
            // Basic space information
            id: spaceData.id,
            roomNumber: spaceData.roomNumber,
            cabinNumber: spaceData.cabinNumber,
            spaceName: spaceData.space_name,
            seater: spaceData.seater,
            
            // Pricing information
            basePrice: parseFloat(spaceData.price),
            gst: parseFloat(spaceData.gst),
            finalPrice: parseFloat(spaceData.finalPrice),
            
            // Availability
            isActive: spaceData.isActive,
            availability: spaceData.availability,
            availableDates: availableDates,
            
            // Images (convert relative paths to full URLs if needed)
            images: spaceData.images?.map(img => 
              img.startsWith('/uploads') ? `${BASE_URL.replace('/api', '')}${img}` : img
            ) || [],
            
            // Additional metadata
            createdAt: spaceData.createdAt,
            updatedAt: spaceData.updatedAt,
            
            // Formatted display values
            displayPrice: `₹${parseFloat(spaceData.price).toLocaleString('en-IN')}`,
            displayFinalPrice: `₹${parseFloat(spaceData.finalPrice).toLocaleString('en-IN')}`,
            gstPercentage: `${spaceData.gst}%`,
            
            // Booking status
            isBookable: spaceData.isActive && availableDates.length > 0,
            availabilityMessage: this.getAvailabilityMessage(spaceData.availability, availableDates.length)
          },
          message: result.message
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error getting space for booking:', error);
      return {
        success: false,
        message: 'Failed to get space details for booking'
      };
    }
  }

  /**
   * Parse and clean available dates from API response
   * @param {Array} availableDates - Raw available dates from API
   * @returns {Array} - Cleaned and parsed dates
   */
  parseAvailableDates(availableDates) {
    if (!Array.isArray(availableDates)) return [];
    
    const cleanedDates = [];
    
    availableDates.forEach(dateObj => {
      if (dateObj && dateObj.date) {
        try {
          // Remove brackets and quotes, split by comma if multiple dates
          let dateStr = dateObj.date
            .replace(/[\[\]"]/g, '') // Remove brackets and quotes
            .trim();
          
          // Split by comma if multiple dates in one string
          const dates = dateStr.split(',').map(d => d.trim()).filter(d => d);
          
          dates.forEach(date => {
            if (date && this.isValidDate(date)) {
              cleanedDates.push({
                id: dateObj.id,
                date: date,
                spaceId: dateObj.spaceId,
                createdAt: dateObj.createdAt,
                updatedAt: dateObj.updatedAt
              });
            }
          });
        } catch (error) {
          console.error('Error parsing date:', dateObj.date, error);
        }
      }
    });
    
    // Sort dates chronologically
    return cleanedDates.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Check if a date string is valid
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} - Whether the date is valid
   */
  isValidDate(dateStr) {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Get availability message based on status and available dates
   * @param {string} availability - Availability status from API
   * @param {number} dateCount - Number of available dates
   * @returns {string} - User-friendly availability message
   */
  getAvailabilityMessage(availability, dateCount) {
    if (availability === "Not Available") {
      return dateCount > 0 ? 
        `Limited availability (${dateCount} dates available)` : 
        "Currently not available";
    }
    
    if (availability === "Available") {
      return dateCount > 0 ? 
        `Available (${dateCount} dates to choose from)` : 
        "Available - Contact for dates";
    }
    
    return availability || "Contact for availability";
  }

  /**
   * Transform API data to match the expected format for the UI
   * @param {Array} apiSpaces - Raw spaces data from API
   * @returns {Array} - Transformed spaces data
   */
  transformSpacesData(apiSpaces) {
    if (!Array.isArray(apiSpaces)) {
      console.warn('Expected array of spaces, got:', typeof apiSpaces);
      return [];
    }

    return apiSpaces.map((space, index) => ({
      id: space._id || space.id || `space-${index}`,
      space_name: space.name || space.title || 'Office Space',
      price: this.formatPrice(space.price || space.pricing || space.rent),
      image: space.image || space.images?.[0] || space.photo || '/default-office.jpg',
      description: space.description || 'Premium workspace solution',
      features: this.extractFeatures(space),
      capacity: space.capacity || space.maxOccupancy || 'Contact for details',
      type: space.type || space.spaceType || 'office',
      location: space.location || space.address,
      isAvailable: space.isAvailable !== false, // Default to available unless explicitly false
      // Additional fields that might be useful
      area: space.area || space.sqft,
      floor: space.floor,
      amenities: space.amenities || []
    }));
  }

  /**
   * Format price for display
   * @param {string|number} price - Raw price data
   * @returns {string} - Formatted price string
   */
  formatPrice(price) {
    if (!price) return 'Contact for Price';
    
    if (typeof price === 'number') {
      return `₹${price.toLocaleString('en-IN')}/month`;
    }
    
    if (typeof price === 'string') {
      // If already formatted, return as is
      if (price.includes('₹') || price.includes('$') || price.toLowerCase().includes('contact')) {
        return price;
      }
      
      // Try to parse as number and format
      const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (!isNaN(numPrice)) {
        return `₹${numPrice.toLocaleString('en-IN')}/month`;
      }
    }
    
    return price.toString();
  }

  /**
   * Extract features from space data
   * @param {Object} space - Space data object
   * @returns {Array} - Array of features
   */
  extractFeatures(space) {
    const features = [];
    
    // Add features from various possible fields
    if (space.features && Array.isArray(space.features)) {
      features.push(...space.features);
    }
    
    if (space.amenities && Array.isArray(space.amenities)) {
      features.push(...space.amenities);
    }
    
    if (space.facilities && Array.isArray(space.facilities)) {
      features.push(...space.facilities);
    }
    
    // Add default features if none provided
    if (features.length === 0) {
      features.push(
        'High-speed internet',
        'Professional environment',
        'Meeting rooms',
        'Reception services'
      );
    }
    
    // Remove duplicates and empty values
    return [...new Set(features.filter(f => f && f.trim()))];
  }
}

// Export a singleton instance
const spacesService = new SpacesService();
export default spacesService;