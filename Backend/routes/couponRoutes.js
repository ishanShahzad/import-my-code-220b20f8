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
    getCouponAnalytics,
    getProductCoupons,
    getStoreCoupons,
} = require('../controllers/couponController');

const router = express.Router();

// Seller routes
router.post('/create', verifyToken, createCoupon);
router.get('/seller', verifyToken, getSellerCoupons);
router.get('/analytics', verifyToken, getCouponAnalytics);
router.put('/update/:id', verifyToken, updateCoupon);
router.delete('/delete/:id', verifyToken, deleteCoupon);
router.patch('/toggle/:id', verifyToken, toggleCoupon);

// Public routes (no auth needed for buyers to see available coupons)
router.get('/product/:productId', getProductCoupons);
router.get('/store/:sellerId', getStoreCoupons);

// Checkout routes
router.post('/validate', verifyToken, validateCoupon);
router.post('/checkout-coupons', verifyToken, getCheckoutCoupons);

module.exports = router;
