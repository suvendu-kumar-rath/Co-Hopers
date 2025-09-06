import apiClient from '../api/client';

/**
 * Payment Service - Handles all payment related API calls
 */
class PaymentService {
  /**
   * Submit payment information
   * @param {Object} paymentData - Payment details
   * @returns {Promise} - API response
   */
  async submitPayment(paymentData) {
    try {
      const formData = new FormData();
      
      // Append payment data
      Object.keys(paymentData).forEach(key => {
        if (key !== 'screenshot' && paymentData[key] !== null && paymentData[key] !== undefined) {
          formData.append(key, paymentData[key]);
        }
      });
      
      // Append screenshot if available
      if (paymentData.screenshot && paymentData.screenshot.file) {
        formData.append('paymentScreenshot', paymentData.screenshot.file);
      }
      
      const response = await apiClient.post('/payments/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error submitting payment:', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - API response
   */
  async verifyPayment(paymentId) {
    try {
      const response = await apiClient.get(`/payments/verify/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   * @param {Object} filters - Filter options
   * @returns {Promise} - API response
   */
  async getPaymentHistory(filters = {}) {
    try {
      const response = await apiClient.get('/payments/history', {
        params: filters,
      });
      return response;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Generate payment invoice
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - API response with invoice data
   */
  async generateInvoice(paymentId) {
    try {
      const response = await apiClient.get(`/payments/invoice/${paymentId}`, {
        responseType: 'blob', // For PDF download
      });
      return response;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Update payment method
   * @param {string} paymentId - Payment ID
   * @param {Object} methodData - New payment method data
   * @returns {Promise} - API response
   */
  async updatePaymentMethod(paymentId, methodData) {
    try {
      const response = await apiClient.put(`/payments/${paymentId}/method`, methodData);
      return response;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Cancel payment
   * @param {string} paymentId - Payment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - API response
   */
  async cancelPayment(paymentId, reason) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/cancel`, {
        reason,
      });
      return response;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  }
}

// Create and export service instance
const paymentService = new PaymentService();
export default paymentService;
