const shippoInstance = require('../../../api-util/shippingSdk');

const create = async body => {
  const shippoTransaction = await shippoInstance.transactions.create(body);
  return shippoTransaction;
};

module.exports = create;
