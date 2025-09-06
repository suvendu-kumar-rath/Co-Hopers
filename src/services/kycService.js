import apiClient from '../api/client';

/**
 * KYC Service - Handles all KYC related API calls
 */
class KYCService {
  /**
   * Submit company KYC data
   * @param {Object} kycData - Company KYC form data
   * @param {Array} files - Array of uploaded files
   * @returns {Promise} - API response
   */
  async submitCompanyKYC(kycData, files) {
    try {
      const formData = new FormData();
      
      // Append form data
      Object.keys(kycData).forEach(key => {
        if (kycData[key] !== null && kycData[key] !== undefined) {
          formData.append(key, kycData[key]);
        }
      });
      
      // Append files
      files.forEach((fileObj, index) => {
        if (fileObj && fileObj.file) {
          formData.append(`file_${index}`, fileObj.file);
          formData.append(`file_${index}_type`, fileObj.type);
          formData.append(`file_${index}_category`, fileObj.category);
        }
      });
      
      const response = await apiClient.post('/kyc/company', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error submitting company KYC:', error);
      throw error;
    }
  }

  /**
   * Submit freelancer KYC data
   * @param {Object} kycData - Freelancer KYC form data
   * @param {Array} files - Array of uploaded files
   * @returns {Promise} - API response
   */
  async submitFreelancerKYC(kycData, files) {
    try {
      const formData = new FormData();
      
      // Append form data
      Object.keys(kycData).forEach(key => {
        if (kycData[key] !== null && kycData[key] !== undefined) {
          formData.append(key, kycData[key]);
        }
      });
      
      // Append files
      files.forEach((fileObj, index) => {
        if (fileObj && fileObj.file) {
          formData.append(`file_${index}`, fileObj.file);
          formData.append(`file_${index}_type`, fileObj.type);
          formData.append(`file_${index}_category`, fileObj.category);
        }
      });
      
      const response = await apiClient.post('/kyc/freelancer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error submitting freelancer KYC:', error);
      throw error;
    }
  }

  /**
   * Submit director KYC data
   * @param {Object} kycData - Director KYC form data
   * @param {Array} files - Array of uploaded files
   * @returns {Promise} - API response
   */
  async submitDirectorKYC(kycData, files) {
    try {
      const formData = new FormData();
      
      // Append form data
      Object.keys(kycData).forEach(key => {
        if (kycData[key] !== null && kycData[key] !== undefined) {
          formData.append(key, kycData[key]);
        }
      });
      
      // Append files
      files.forEach((fileObj, index) => {
        if (fileObj && fileObj.file) {
          formData.append(`file_${index}`, fileObj.file);
          formData.append(`file_${index}_type`, fileObj.type);
          formData.append(`file_${index}_category`, fileObj.category);
        }
      });
      
      const response = await apiClient.post('/kyc/director', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error submitting director KYC:', error);
      throw error;
    }
  }

  /**
   * Get KYC status
   * @param {string} applicationId - KYC application ID
   * @returns {Promise} - API response
   */
  async getKYCStatus(applicationId) {
    try {
      const response = await apiClient.get(`/kyc/status/${applicationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  }

  /**
   * Upload additional documents
   * @param {string} applicationId - KYC application ID
   * @param {Array} files - Array of additional files
   * @returns {Promise} - API response
   */
  async uploadAdditionalDocuments(applicationId, files) {
    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      
      files.forEach((fileObj, index) => {
        if (fileObj && fileObj.file) {
          formData.append(`additional_file_${index}`, fileObj.file);
          formData.append(`additional_file_${index}_type`, fileObj.type);
          formData.append(`additional_file_${index}_category`, fileObj.category);
        }
      });
      
      const response = await apiClient.post('/kyc/additional-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error uploading additional documents:', error);
      throw error;
    }
  }
}

// Create and export service instance
const kycService = new KYCService();
export default kycService;
