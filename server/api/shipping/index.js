const express = require('express');
const validateAddress = require('./validate-address');
const getShippingRates = require('./get-shipping-rates');
const createShippingLabel = require('./create-shipping-label');

const shippingRouter = express.Router();

// Address validation endpoint
shippingRouter.post('/validate', validateAddress);

// Shipping rates calculation endpoint
shippingRouter.post('/rates', getShippingRates);

// Shipping label creation endpoint
shippingRouter.post('/label', createShippingLabel);

module.exports = shippingRouter;
