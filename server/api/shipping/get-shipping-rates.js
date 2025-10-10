const { denormalisedResponseEntities } = require('../../api-util/format');
const { getSdk, handleError, serialize } = require('../../api-util/sdk');
const { UserServices, ShippingServices } = require('../../services');
const { validateRequiredFields, getAddress } = require('../../api-util/common');

/**
 * Get shipping rates for a transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShippingRates = async (req, res) => {
  try {
    const sdk = getSdk(req, res);
    const { customerId, providerId, listingId } = req.body || {};

    // Input validation
    validateRequiredFields(req.body, ['customerId', 'providerId', 'listingId']);

    // Fetch user data
    const [customer, provider] = await Promise.all([
      UserServices.get(customerId, { expand: true }),
      UserServices.get(providerId, { expand: true }),
    ]);
    const customerAddress = getAddress(customer);
    const providerAddress = getAddress(provider);
    // Validate users have shipping addresses
    if (!customerAddress) {
      const error = new Error('Customer does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    if (!providerAddress) {
      const error = new Error('Provider does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    // Fetch listing data
    const listingResponse = await sdk.listings.show({ id: listingId });
    const [listing] = denormalisedResponseEntities(listingResponse);

    // Extract package dimensions and weight
    const {
      dimension_unit,
      weight,
      weight_unit,
      length,
      width,
      height,
    } = listing.attributes.publicData;

    // Validate package data
    if (!weight || !length || !width || !height) {
      const error = new Error('Listing is missing required package dimensions or weight');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    // Prepare parcel data for shipping calculation
    const parcels = [
      {
        massUnit: weight_unit,
        weight: String(weight),
        length: String(length),
        width: String(width),
        height: String(height),
        distanceUnit: dimension_unit,
      },
    ];

    // Create shipment and get rates
    const shipment = await ShippingServices.shipments.create({
      addressFrom: customerAddress,
      addressTo: providerAddress,
      parcels,
    });

    const listingCurrency = listing?.attributes?.price?.currency;
    const rateByListingCurrency = listingCurrency
      ? await ShippingServices.rates.listShipmentRatesByCurrencyCode({
          shipmentId: shipment.objectId,
          currencyCode: listingCurrency,
        })
      : null;

    const rateWithListingCurrencyCorrected =
      rateByListingCurrency?.results?.map(rate => {
        return {
          ...rate,
          amount: rate.amountLocal,
          currency: rate.currencyLocal,
        };
      }) || [];
    // Send response
    const status = 200;
    const statusText = 'OK';

    res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data: {
            ...shipment,
            ...(rateWithListingCurrencyCorrected.length > 0 && {
              rates: rateWithListingCurrencyCorrected,
            }),
          },
        })
      )
      .end();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = getShippingRates;
