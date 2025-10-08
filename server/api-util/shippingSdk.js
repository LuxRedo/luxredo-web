const { Shippo } = require('shippo');

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY_HEADER,
  shippoApiVersion: process.env.SHIPPO_API_VERSION,
});

module.exports = shippo;
