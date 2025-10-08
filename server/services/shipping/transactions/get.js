const shippoInstance = require('../../../api-util/shippingSdk');

const get = async id => {
  const shippoTransaction = await shippoInstance.transactions.get(id);
  return shippoTransaction;
};

module.exports = get;
