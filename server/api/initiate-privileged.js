const { denormalisedResponseEntities } = require('../api-util/format');
const { transactionLineItems } = require('../api-util/lineItems');
const {
  getSdk,
  getTrustedSdk,
  handleError,
  serialize,
  fetchCommission,
} = require('../api-util/sdk');
const { ShippingServices, TransactionServices } = require('../services');

/**
 * Initiate a privileged transaction with optional shipping
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initiatePrivilegedTransaction = async (req, res) => {
  try {
    const { isSpeculative, orderData, bodyParams, queryParams } = req.body;
    const sdk = getSdk(req, res);

    // Fetch required data
    const [listingResponse, commissionResponse, shippingRate] = await Promise.all([
      sdk.listings.show({ id: bodyParams?.params?.listingId }),
      fetchCommission(sdk),
      orderData?.shippingRateId
        ? ShippingServices.rates.get(orderData.shippingRateId)
        : Promise.resolve(null),
    ]);

    // Validate shipping rate if provided
    if (orderData?.shippingRateId && !shippingRate) {
      const message = `Shipping rate ${orderData.shippingRateId} not found`;
      const error = new Error(message);
      error.status = 404;
      error.statusText = message;
      throw error;
    }

    // Extract data from responses
    const listing = listingResponse.data.data;
    const commissionAsset = commissionResponse.data.data[0];
    const { providerCommission, customerCommission } =
      commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

    // Generate line items
    const lineItems = transactionLineItems(
      listing,
      { ...orderData, ...bodyParams.params },
      providerCommission,
      customerCommission,
      shippingRate
    );

    // Get trusted SDK for transaction initiation
    const trustedSdk = await getTrustedSdk(req);
    const { params } = bodyParams;

    // Prepare request body with line items
    const body = {
      ...bodyParams,
      params: {
        ...params,
        lineItems,
      },
    };

    // Initiate transaction (speculative or regular)
    const apiResponse = isSpeculative
      ? await trustedSdk.transactions.initiateSpeculative(body, queryParams)
      : await trustedSdk.transactions.initiate(body, queryParams);

    const { status, statusText, data } = apiResponse;

    if (!isSpeculative) {
      const [transaction] = denormalisedResponseEntities(apiResponse);
      TransactionServices.handleAfterInitiateTransaction(orderData, bodyParams, transaction);
    }

    // Send response
    res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data,
        })
      )
      .end();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = initiatePrivilegedTransaction;
