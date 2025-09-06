// Payment method constants
export const PAYMENT_METHODS = {
  SCAN: 'scan',
  ACCOUNT: 'account',
};

// Payment steps
export const PAYMENT_STEPS = {
  SELECT_METHOD: 0,
  UPLOAD_SCREENSHOT: 1,
};

// Payment configuration
export const PAYMENT_CONFIG = {
  UPI_ID: 'cohopers@paytm',
  BANK_DETAILS: {
    accountName: 'CoHopers Private Limited',
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png'],
  ACCEPTED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};

export default PAYMENT_CONFIG;
