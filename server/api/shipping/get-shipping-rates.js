const { denormalisedResponseEntities } = require('../../api-util/format');
const { getSdk, handleError, serialize } = require('../../api-util/sdk');
const { UserServices, ShippingServices } = require('../../services');
const { validateRequiredFields, getAddressId } = require('../../api-util/common');

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

    // Validate users have shipping addresses
    if (!getAddressId(customer)) {
      const error = new Error('Customer does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    if (!getAddressId(provider)) {
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
      addressFrom: getAddressId(customer),
      addressTo: getAddressId(provider),
      parcels,
    });

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
          data: shipment.rates,
        })
      )
      .end();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = getShippingRates;
