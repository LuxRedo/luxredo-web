const shippoInstance = require('../../../api-util/shippingSdk');

// Shippo validation via address creation with validate flag
const validate = async address => {
  if (!address || typeof address !== 'object') {
    const error = new Error('address object is required');
    error.status = 400;
    throw error;
  }

  const body = { ...address, validate: true };
  const response = await shippoInstance.addresses.create(body);
  return response;
};

module.exports = validate;
