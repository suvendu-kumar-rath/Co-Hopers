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
    return '';
  }

  // Ensure imagePath is a string
  if (typeof imagePath !== 'string') {
    console.warn('[imageUtils] getImageUrl: Invalid image path type:', typeof imagePath, imagePath);
    return '';
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = getImageBaseUrl();
  
  // Ensure imagePath starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct full URL
  const fullUrl = `${baseUrl}${normalizedPath}`;
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
  
  // Parse images if it's a JSON string
  let imagesArray = space.images;
  if (typeof imagesArray === 'string') {
    try {
      imagesArray = JSON.parse(imagesArray);
    } catch (e) {
      // Not valid JSON, skip
      imagesArray = null;
    }
  }
  
  if (imagesArray && Array.isArray(imagesArray) && imagesArray.length > 0) {
    // Get the first image, but ensure it's a string (not a nested array)
    let firstImage = imagesArray[0];
    
    // If it's an array, try to get the first element from it
    if (Array.isArray(firstImage) && firstImage.length > 0) {
      firstImage = firstImage[0];
    }
    
    // Only use it if it's a string
    if (typeof firstImage === 'string') {
      imagePath = firstImage;
    }
  }
  
  // If images array didn't provide a valid path, check other fields
  if (!imagePath) {
    imagePath = space.image || space.imagePath || space.image_url || space.imageUrl;
  }
  
  if (!imagePath) {
    console.warn('[imageUtils] getSpaceImageUrl: No valid image found for space:', {
      title: space.title || space.space_name,
      images: space.images,
      image: space.image,
      imagePath: space.imagePath
    });
  }
  
  return getImageUrl(imagePath);
};

const imageUtils = {
  getImageBaseUrl,
  getImageUrl,
  getSpaceImageUrl
};

export default imageUtils;
