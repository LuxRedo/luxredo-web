const shippoInstance = require('../../../api-util/shippingSdk');

const get = async rateId => {
  const response = await shippoInstance.rates.get(rateId);
  return response;
};

module.exports = get;
