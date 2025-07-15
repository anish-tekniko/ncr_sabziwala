const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVarient', required: true },
    name: { type: String, required: true },
    unit: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    items: { type: [OrderItemSchema], required: true },

    itemTotal: { type: Number, required: true },
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    packingCharge: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    deliveryAddressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    deliveryDate: { type: Date, required: true },
    deliveryTime: { type: String, required: true },

    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },

    paymentMode: {
        type: String,
        enum: ['cash', 'card', 'upi', 'wallet', 'cod', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentId: { type: String, default: null },

    assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },

    // Timestamps for tracking
    preparationStartedAt: { type: Date, default: null },
    readyAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    
    refundStatus: { type: String, enum: ['not_requested', 'requested', 'processed'], default: 'not_requested' },
    refundAmount: { type: Number, default: 0 },
    refundAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
