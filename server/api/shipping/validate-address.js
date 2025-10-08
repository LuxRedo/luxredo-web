const { handleError } = require('../../api-util/sdk');
const { ShippingServices } = require('../../services');
const { parseShippingError, validateRequiredFields } = require('../../api-util/common');

/**
 * Validate shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateAddress = async (req, res) => {
  try {
    const { address } = req.body || {};

    // Input validation
    validateRequiredFields(req.body, ['address']);

    // Extract street number and rest of address
    const { streetNo, ...rest } = address;

    // Create address validation request
    const result = await ShippingServices.address.create({
      ...rest,
      ...(streetNo ? { street_no: streetNo } : {}),
    });

    // Send success response
    res.status(200).json(result);
  } catch (error) {
    const formattedError = parseShippingError(error);
    handleError(res, formattedError);
  }
};

module.exports = validateAddress;
