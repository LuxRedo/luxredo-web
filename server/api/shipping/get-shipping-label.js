const { handleError } = require('../../api-util/sdk');
const { ShippingServices, TransactionServices } = require('../../services');
const { parseShippingError, validateRequiredFields } = require('../../api-util/common');

/**
 * Get shipping label by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShippingLabel = async (req, res) => {
  try {
    const { transactionId, shouldResyncShippingDetails } = req.body || {};

    // Input validation
    validateRequiredFields(req.body, ['transactionId']);

    const transaction = await TransactionServices.get(transactionId);
    const labelId = transaction?.attributes?.metadata?.shippingDetails?.transactionId;
    // Fetch shipping label
    const shippingLabel = await ShippingServices.transactions.get(labelId);

    const newShippingDetails = {
      transactionId: shippingLabel.objectId,
      trackingNumber: shippingLabel.trackingNumber,
      trackingUrl: shippingLabel.trackingUrlProvider,
      labelUrl: shippingLabel.labelUrl,
    };
    if (shouldResyncShippingDetails) {
      // Update transaction metadata with shipping details
      await TransactionServices.updateMetadata(transaction.id.uuid, {
        shippingDetails: newShippingDetails,
      });
    }
    // Send success response
    res.status(200).json(newShippingDetails);
  } catch (error) {
    const formattedError = parseShippingError(error);
    handleError(res, formattedError);
  }
};

module.exports = getShippingLabel;
