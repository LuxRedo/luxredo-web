const {
  TRANSITION_REQUEST_PAYMENT,
  TRANSITION_REQUEST_PAYMENT_AFTER_INQUIRY,
} = require('../../api-util/transitionHelpers');
const log = require('../../log');
const ShippingServices = require('../shipping');
const updateTransactionMetadata = require('./updateMetadata');

/**
 * Check if the transition is a payment request
 * @param {string} transition - Transition name
 * @returns {boolean} True if it's a payment request transition
 */
const isPaymentRequestTransition = transition => {
  return [TRANSITION_REQUEST_PAYMENT, TRANSITION_REQUEST_PAYMENT_AFTER_INQUIRY].includes(
    transition
  );
};

const handleAfterInitiateTransaction = async (orderData, bodyParams, transaction) => {
  try {
    const isPaymentRequest = isPaymentRequestTransition(bodyParams.transition);

    if (isPaymentRequest) {
      const shippingTransaction = await ShippingServices.transactions.create({
        rate: orderData?.shippingRateId,
        metadata: `Sharetribe Transaction ID #${transaction.id.uuid}`,
      });

      // Create shipping transaction in background
      // Need to waiting for few second to ignore conflict error return from Sharetribe
      new Promise(resolve => setTimeout(resolve, 5000)).then(async () => {
        const newestTransaction = await ShippingServices.transactions.get(
          shippingTransaction.objectId
        );
        await updateTransactionMetadata(transaction.id, {
          shippingDetails: {
            transactionId: newestTransaction.objectId,
            trackingNumber: newestTransaction.trackingNumber,
            trackingUrl: newestTransaction.trackingUrlProvider,
            labelUrl: newestTransaction.labelUrl,
          },
        });
      });
    }
  } catch (error) {
    log.error(error, 'handleAfterInitiateTransaction');
  }
};

module.exports = handleAfterInitiateTransaction;
