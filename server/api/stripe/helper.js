const { getIntegrationSdk } = require('../../api-util/sdk');
const { TransactionServices } = require('../../services');

const paymentMethodsAvailable = ['affirm'];

const confirmPaymentTransition = async data => {
  try {
    const iSdk = getIntegrationSdk();
    const { metadata, payment_method_types } = data;

    if (!paymentMethodsAvailable.includes(payment_method_types[0])) {
      console.log('Payment method not supported', payment_method_types[0]);
      return;
    }

    const txRes = await iSdk.transactions.show({
      id: metadata['sharetribe-transaction-id'],
      include: ['provider', 'listing'],
    });

    const transactionId = txRes.data.data.id.uuid;

    await iSdk.transactions.transition({
      id: transactionId,
      transition: 'transition/confirm-push-payment',
      params: {},
    });

    await TransactionServices.createShippingLabelWithOrder(transactionId);
  } catch (error) {
    console.log('Failed to update confirm payment transition', error);
  }
};

module.exports = {
  confirmPaymentTransition,
};
