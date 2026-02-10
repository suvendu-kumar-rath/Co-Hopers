import { PAYMENT_CONFIG } from '../../constants/payment';

/**
 * Validates file type and size
 * @param {File} file - File to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  const isValidType = PAYMENT_CONFIG.ACCEPTED_MIME_TYPES.includes(file.type);
  if (!isValidType) {
    return { 
      isValid: false, 
      error: 'Please upload a PDF, JPG, or PNG file' 
    };
  }

  // Check file size
  if (file.size > PAYMENT_CONFIG.MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: 'File size should be less than 10MB' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Creates a file object with metadata
 * @param {File} file - Original file
 * @returns {Object} - File object with metadata
 */
export const createFileObject = (file) => {
  return {
    file,
    name: file.name,
    type: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

const fileUtils = {
  validateFile,
  createFileObject,
  formatFileSize,
  getFileExtension,
};

export default fileUtils;
