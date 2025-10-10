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
        async: false,
      });

      await updateTransactionMetadata(transaction.id, {
        shippingDetails: {
          transactionId: shippingTransaction.objectId,
          trackingNumber: shippingTransaction.trackingNumber,
          trackingUrl: shippingTransaction.trackingUrlProvider,
          labelUrl: shippingTransaction.labelUrl,
        },
      });
    }
  } catch (error) {
    log.error(error, 'handleAfterInitiateTransaction');
  }
};

module.exports = handleAfterInitiateTransaction;
