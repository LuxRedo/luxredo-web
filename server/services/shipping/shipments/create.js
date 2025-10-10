const shippoInstance = require('../../../api-util/shippingSdk');

const create = async shipment => {
  const response = await shippoInstance.shipments.create(shipment);
  return response;
};

module.exports = create;
