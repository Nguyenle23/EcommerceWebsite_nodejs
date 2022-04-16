const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let Order = new Schema({
    // userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    // orderStatus: { type: String, maxLength: 255 },
    // orderAmount: { type: Number, default: 0 },
    // orderTracker: { type: String, maxLength: 255 },
    name: { type: String, maxLength: 255 },
    phonenumber: { type: String, maxLength: 255 },
    address: { type: String, maxLength: 255 },
    note: { type: String, maxLength: 255 },
    items: [{
        sku: [{ type: String }],
        qty: [{ type: String }],
        price: [{ type: String }],
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Orders', Order);