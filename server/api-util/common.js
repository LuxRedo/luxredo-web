/**
 * Shipping API utility functions
 */

/**
 * Parse Shippo API error response
 * @param {Object} error - Error object from Shippo API
 * @returns {Object} Formatted error object
 */
const parseShippingError = error => {
  if (error.body) {
    try {
      const body = JSON.parse(error.body);
      const message = Object.values(body)
        .flat()
        .join(', ');
      const newError = new Error(message);
      newError.status = 400;
      newError.statusText = 'Bad Request';
      return newError;
    } catch (parseError) {
      return error;
    }
  }
  return error;
};

/**
 * Create standardized success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Standardized response object
 */
const createSuccessResponse = (data, message = 'Operation completed successfully') => ({
  success: true,
  data,
  message,
});

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @throws {Error} If required fields are missing
 */
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required parameters: ${missingFields.join(', ')} are required`
    );
    error.status = 400;
    error.statusText = 'Bad Request';
    throw error;
  }
};

/**
 * Extract shipping address ID from user profile
 * @param {Object} user - User object
 * @returns {string|null} Shipping address ID or null if not found
 */
const getAddressId = user => {
  const { attributes } = user;
  const { profile } = attributes;
  const { protectedData } = profile;
  const { shippingAddress } = protectedData;
  return shippingAddress?.id;
};

module.exports = {
  parseShippingError,
  createSuccessResponse,
  validateRequiredFields,
  getAddressId,
};
