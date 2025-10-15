const { handleError } = require('../../api-util/sdk');
const { TransactionServices } = require('../../services');
const { parseShippingError, validateRequiredFields } = require('../../api-util/common');

/**
 * Get shipping label by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShippingLabel = async (req, res) => {
  try {
    const { transactionId } = req.body || {};
    const uuid = typeof transactionId === 'object' ? transactionId.uuid : transactionId;

    // Input validation
    validateRequiredFields(req.body, ['transactionId']);
    const newShippingDetails = await TransactionServices.createShippingLabelWithOrder(uuid);
    // Send success response
    res.status(200).json(newShippingDetails);
  } catch (error) {
    const formattedError = parseShippingError(error);
    handleError(res, formattedError);
  }
};

module.exports = createShippingLabel;
