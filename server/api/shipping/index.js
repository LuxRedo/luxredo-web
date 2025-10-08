const express = require('express');
const validateAddress = require('./validate-address');
const getShippingRates = require('./get-shipping-rates');
const getShippingLabel = require('./get-shipping-label');

const shippingRouter = express.Router();

// Address validation endpoint
shippingRouter.post('/validate', validateAddress);

// Shipping rates calculation endpoint
shippingRouter.post('/rates', getShippingRates);

// Shipping label retrieval endpoint
shippingRouter.post('/label', getShippingLabel);

module.exports = shippingRouter;
