// import apiClient from '../api/client';

// /**
//  * Office Service - Handles all office/space related API calls
//  */
// class OfficeService {
//   /**
//    * Get all available offices
//    * @param {Object} filters - Filter options
//    * @returns {Promise} - API response
//    */
//   async getOffices(filters = {}) {
//     try {
//       const response = await apiClient.get('/offices', {
//         params: filters,
//       });
//       return response;
//     } catch (error) {
//       console.error('Error fetching offices:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get office details by ID
//    * @param {string} officeId - Office ID
//    * @returns {Promise} - API response
//    */
//   async getOfficeById(officeId) {
//     try {
//       const response = await apiClient.get(`/offices/${officeId}`);
//       return response;
//     } catch (error) {
//       console.error('Error fetching office details:', error);
//       throw error;
//     }
//   }

//   /**
//    * Book an office space
//    * @param {Object} bookingData - Booking details
//    * @returns {Promise} - API response
//    */
//   async bookOffice(bookingData) {
//     try {
//       const response = await apiClient.post('/offices/book', bookingData);
//       return response;
//     } catch (error) {
//       console.error('Error booking office:', error);
//       throw error;
//     }
//   }

//   /**
//    * Check office availability
//    * @param {string} officeId - Office ID
//    * @param {Object} dateRange - Date range for availability check
//    * @returns {Promise} - API response
//    */
//   async checkAvailability(officeId, dateRange) {
//     try {
//       const response = await apiClient.get(`/offices/${officeId}/availability`, {
//         params: dateRange,
//       });
//       return response;
//     } catch (error) {
//       console.error('Error checking availability:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get booking history
//    * @param {Object} filters - Filter options
//    * @returns {Promise} - API response
//    */
//   async getBookingHistory(filters = {}) {
//     try {
//       const response = await apiClient.get('/offices/bookings', {
//         params: filters,
//       });
//       return response;
//     } catch (error) {
//       console.error('Error fetching booking history:', error);
//       throw error;
//     }
//   }

//   /**
//    * Cancel booking
//    * @param {string} bookingId - Booking ID
//    * @param {string} reason - Cancellation reason
//    * @returns {Promise} - API response
//    */
//   async cancelBooking(bookingId, reason) {
//     try {
//       const response = await apiClient.post(`/offices/bookings/${bookingId}/cancel`, {
//         reason,
//       });
//       return response;
//     } catch (error) {
//       console.error('Error cancelling booking:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get office reviews
//    * @param {string} officeId - Office ID
//    * @returns {Promise} - API response
//    */
//   async getOfficeReviews(officeId) {
//     try {
//       const response = await apiClient.get(`/offices/${officeId}/reviews`);
//       return response;
//     } catch (error) {
//       console.error('Error fetching office reviews:', error);
//       throw error;
//     }
//   }

//   /**
//    * Submit office review
//    * @param {string} officeId - Office ID
//    * @param {Object} reviewData - Review data
//    * @returns {Promise} - API response
//    */
//   async submitReview(officeId, reviewData) {
//     try {
//       const response = await apiClient.post(`/offices/${officeId}/reviews`, reviewData);
//       return response;
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get office amenities
//    * @param {string} officeId - Office ID
//    * @returns {Promise} - API response
//    */
//   async getOfficeAmenities(officeId) {
//     try {
//       const response = await apiClient.get(`/offices/${officeId}/amenities`);
//       return response;
//     } catch (error) {
//       console.error('Error fetching office amenities:', error);
//       throw error;
//     }
//   }

//   /**
//    * Search offices
//    * @param {Object} searchParams - Search parameters
//    * @returns {Promise} - API response
//    */
//   async searchOffices(searchParams) {
//     try {
//       const response = await apiClient.get('/offices/search', {
//         params: searchParams,
//       });
//       return response;
//     } catch (error) {
//       console.error('Error searching offices:', error);
//       throw error;
//     }
//   }
// }

// // Create and export service instance
// const officeService = new OfficeService();
// export default officeService;
