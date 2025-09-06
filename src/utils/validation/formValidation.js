/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Validation result
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates mobile number (Indian format)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - Validation result
 */
export const isValidMobile = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\s+/g, ''));
};

/**
 * Validates PAN number format
 * @param {string} pan - PAN number to validate
 * @returns {boolean} - Validation result
 */
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Validates DIN (Director Identification Number)
 * @param {string} din - DIN to validate
 * @returns {boolean} - Validation result
 */
export const isValidDIN = (din) => {
  const dinRegex = /^[0-9]{8}$/;
  return dinRegex.test(din);
};

/**
 * Validates GSTIN format
 * @param {string} gstin - GSTIN to validate
 * @returns {boolean} - Validation result
 */
export const isValidGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

/**
 * Validates required fields
 * @param {Object} data - Form data object
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with errors
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'This field is required';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates company form data
 * @param {Object} formData - Company form data
 * @returns {Object} - Validation result
 */
export const validateCompanyForm = (formData) => {
  const errors = {};
  
  // Required fields validation
  const requiredFields = ['companyName', 'directorName', 'din'];
  const requiredValidation = validateRequiredFields(formData, requiredFields);
  
  if (!requiredValidation.isValid) {
    Object.assign(errors, requiredValidation.errors);
  }
  
  // DIN validation
  if (formData.din && !isValidDIN(formData.din)) {
    errors.din = 'Please enter a valid DIN (8 digits)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates KYC form data
 * @param {Object} formData - KYC form data
 * @returns {Object} - Validation result
 */
export const validateKYCForm = (formData) => {
  const errors = {};
  
  // Email validation
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Mobile validation
  if (formData.mobile && !isValidMobile(formData.mobile)) {
    errors.mobile = 'Please enter a valid mobile number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  isValidEmail,
  isValidMobile,
  isValidPAN,
  isValidDIN,
  isValidGSTIN,
  validateRequiredFields,
  validateCompanyForm,
  validateKYCForm,
};
