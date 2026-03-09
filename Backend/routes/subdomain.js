const express = require('express');
const router = express.Router();
const subdomainController = require('../controllers/subdomainController');
const subdomainDetector = require('../middleware/subdomainDetector');

// Apply subdomain detector middleware to all routes
router.use(subdomainDetector);

// Get store info for current subdomain
router.get('/store', subdomainController.getSubdomainStore);

// Get products for current subdomain store
router.get('/products', subdomainController.getSubdomainProducts);

module.exports = router;
