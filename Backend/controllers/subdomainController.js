// Controller to handle subdomain store requests
const Store = require('../models/Store');
const Product = require('../models/Product');

// Get store data for subdomain
exports.getSubdomainStore = async (req, res) => {
    try {
        if (!req.subdomainStore) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        const store = req.subdomainStore;

        res.status(200).json({
            msg: 'Store fetched successfully',
            store,
            isSubdomain: true
        });
    } catch (error) {
        console.error('Get subdomain store error:', error);
        res.status(500).json({ msg: 'Server error while fetching store' });
    }
};

// Get products for subdomain store
exports.getSubdomainProducts = async (req, res) => {
    try {
        if (!req.subdomainStore) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        const { categories, brands, priceRange, search, page = 1, limit = 20 } = req.query;
        const store = req.subdomainStore;

        // Build query for products
        let query = { seller: store.seller };

        // Apply filters
        if (categories) {
            const categoryArray = Array.isArray(categories) ? categories : [categories];
            query.category = { $in: categoryArray };
        }

        if (brands) {
            const brandArray = Array.isArray(brands) ? brands : [brands];
            query.brand = { $in: brandArray };
        }

        if (priceRange) {
            const [min, max] = priceRange.split(',').map(Number);
            query.price = { $gte: min, $lte: max };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            msg: 'Products fetched successfully',
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get subdomain products error:', error);
        res.status(500).json({ msg: 'Server error while fetching products' });
    }
};
