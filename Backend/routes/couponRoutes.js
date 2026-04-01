const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const {
    createCoupon,
    getSellerCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCoupon,
    validateCoupon,
    getCheckoutCoupons,
} = require('../controllers/couponController');

const router = express.Router();

// Seller routes
router.post('/create', verifyToken, createCoupon);
router.get('/seller', verifyToken, getSellerCoupons);
router.put('/update/:id', verifyToken, updateCoupon);
router.delete('/delete/:id', verifyToken, deleteCoupon);
router.patch('/toggle/:id', verifyToken, toggleCoupon);

// Checkout routes
router.post('/validate', verifyToken, validateCoupon);
router.post('/checkout-coupons', verifyToken, getCheckoutCoupons);

module.exports = router;
