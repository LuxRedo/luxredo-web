const address = require('./address');
const shipments = require('./shipments');
const rates = require('./rates');
const transactions = require('./transactions');
const shippo = {
  address,
  shipments,
  rates,
  transactions,
};

module.exports = shippo;
