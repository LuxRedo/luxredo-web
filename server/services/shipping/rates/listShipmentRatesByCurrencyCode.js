const shippoInstance = require('../../../api-util/shippingSdk');

const listShipmentRatesByCurrencyCode = async ({ shipmentId, currencyCode }) => {
  const rates = await shippoInstance.rates.listShipmentRatesByCurrencyCode({
    shipmentId,
    currencyCode,
  });
  return rates;
};

module.exports = listShipmentRatesByCurrencyCode;
