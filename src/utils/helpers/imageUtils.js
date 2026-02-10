/**
 * Image utility functions
 * Handles image URL construction and formatting
 */

import { ENV_CONFIG } from '../../config/environment';

/**
 * Get the base URL for images (without the /api suffix)
 * @returns {string} Base URL for images
 */
export const getImageBaseUrl = () => {
  const apiBaseUrl = ENV_CONFIG.API_BASE_URL || 'https://api.boldtribe.in/api';
  const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  
  console.log('[imageUtils] getImageBaseUrl: API Base URL:', apiBaseUrl, '-> Image Base URL:', baseUrl);
  
  // Remove /api suffix if present to get the domain base URL
  return baseUrl;
};

/**
 * Constructs a full image URL from a relative path
 * Handles various path formats and ensures correct URL construction
 * 
 * @param {string} imagePath - The image path from API (e.g., "/uploads/spaces/image.jpg" or "uploads/spaces/image.jpg")
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('[imageUtils] getImageUrl: No image path provided');
    return '';
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('[imageUtils] getImageUrl: Already a full URL:', imagePath);
    return imagePath;
  }

  const baseUrl = getImageBaseUrl();
  
  // Ensure imagePath starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct full URL
  const fullUrl = `${baseUrl}${normalizedPath}`;
  console.log('[imageUtils] getImageUrl: Constructed URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

/**
 * Formats space image URL
 * @param {Object} space - Space object from API
 * @returns {string} Formatted image URL
 */
export const getSpaceImageUrl = (space) => {
  if (!space) {
    console.log('[imageUtils] getSpaceImageUrl: No space object provided');
    return '';
  }

  // Try different possible image field names
  // Check images array first (API stores images in an array)
  let imagePath = null;
  
  if (space.images && Array.isArray(space.images) && space.images.length > 0) {
    imagePath = space.images[0];
  } else {
    imagePath = space.image || space.imagePath || space.image_url || space.imageUrl;
  }
  
  console.log('[imageUtils] getSpaceImageUrl: Space object:', space);
  console.log('[imageUtils] getSpaceImageUrl: Found image path:', imagePath);
  
  return getImageUrl(imagePath);
};

const imageUtils = {
  getImageBaseUrl,
  getImageUrl,
  getSpaceImageUrl
};

export default imageUtils;
