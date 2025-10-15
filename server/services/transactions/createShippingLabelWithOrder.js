const ShippingServices = require('../shipping');
const get = require('./get');
const updateMetadata = require('./updateMetadata');

const createShippingLabelWithOrder = async id => {
  const uuid = typeof id === 'object' ? id.uuid : id;
  const transaction = await get(uuid);
  const shippingRateId = transaction?.attributes?.protectedData?.shippingRateId;
  const alreadyHasShippingLabel = transaction?.attributes?.metadata?.shippingDetails?.transactionId;

  if (alreadyHasShippingLabel) {
    return transaction?.attributes?.metadata?.shippingDetails;
  }

  if (!shippingRateId) {
    const error = new Error('Shipping rate ID is required');
    error.status = 400;
    throw error;
  }

  // Fetch shipping label
  const shippingLabel = await ShippingServices.transactions.create({
    rate: shippingRateId,
    metadata: `Sharetribe Transaction ID #${transaction.id.uuid}`,
    async: false,
  });

  await updateMetadata(transaction.id.uuid, {
    shippingDetails: {
      transactionId: shippingLabel.objectId,
      trackingNumber: shippingLabel.trackingNumber,
      trackingUrl: shippingLabel.trackingUrlProvider,
      labelUrl: shippingLabel.labelUrl,
    },
  });

  const newShippingDetails = {
    transactionId: shippingLabel.objectId,
    trackingNumber: shippingLabel.trackingNumber,
    trackingUrl: shippingLabel.trackingUrlProvider,
    labelUrl: shippingLabel.labelUrl,
  };

  return newShippingDetails;
};

module.exports = createShippingLabelWithOrder;
