const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/authMiddleware')
const { generateProductTags, bulkGenerateTags, getTagSuggestions } = require('../controllers/smartTagController')

// Generate tags for a single product
router.post('/generate/:productId', verifyToken, generateProductTags)

// Bulk generate tags for multiple products
router.post('/bulk-generate', verifyToken, bulkGenerateTags)

// Get tag suggestions for a new product
router.post('/suggestions', getTagSuggestions)

module.exports = router
