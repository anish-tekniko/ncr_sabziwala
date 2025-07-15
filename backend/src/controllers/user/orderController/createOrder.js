
const Order = require("../../../models/order");
const Product = require('../../../models/product');
const ProductVariant = require('../../../models/productVarient');
const Address = require('../../../models/address');

exports.createOrder = async (req, res) => {
    try {
        const {
            items, // array of { productId, variantId, quantity }
            deliveryAddressId,
            deliveryDate,
            deliveryTime,
            paymentMode,
            couponCode = null,
            deliveryCharge = 0,
            packingCharge = 0
        } = req.body;

        const userId = req.user._id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }

        const orderItems = [];
        let itemTotal = 0;

        for (const item of items) {
            const variant = await ProductVariant.findById(item.variantId);
            if (!variant || variant.status !== 'active') {
                return res.status(400).json({ message: `Variant not found or inactive: ${item.variantId}` });
            }

            const product = await Product.findById(item.productId);
            if (!product || product.status !== 'active') {
                return res.status(400).json({ message: `Product not found or inactive: ${item.productId}` });
            }

            const price = variant.price;
            const originalPrice = variant.originalPrice || price;
            const discount = variant.discount || 0;
            const quantity = item.quantity || 1;

            const finalPrice = price * quantity;

            itemTotal += finalPrice;

            orderItems.push({
                productId: item.productId,
                variantId: item.variantId,
                name: product.name + ' - ' + variant.name,
                unit: variant.unit,
                price,
                quantity,
                originalPrice,
                discount,
                finalPrice
            });
        }

        let couponDiscount = 0;

        // Optional: apply coupon logic
        // if (couponCode) {
        //     const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        //     if (coupon) {
        //         couponDiscount = ...;
        //     }
        // }

        const finalAmount = itemTotal + deliveryCharge + packingCharge - couponDiscount;

        const orderCount = await Order.countDocuments();
        const booking_id = `ORD-${String(orderCount + 1).padStart(3, '0')}`;

        const newOrder = new Order({
            orderId: booking_id,
            userId,
            items: orderItems,
            itemTotal,
            couponCode,
            couponDiscount,
            deliveryCharge,
            packingCharge,
            finalAmount,
            deliveryAddressId,
            deliveryDate,
            deliveryTime,
            paymentMode,
            paymentStatus: paymentMode === 'cod' || paymentMode === 'cash' ? 'pending' : 'paid'
        });

        await newOrder.save();

        return res.status(201).json({
            message: 'Order created successfully',
            order: newOrder
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
