const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let Order = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    name: { type: String, maxLength: 255 }, 
    phonenumber: { type: String, maxLength: 255 },
    address: { type: String, maxLength: 255 },
    note: { type: String, maxLength: 255 },
    orderStatus: { type: String, maxLength: 255, default: 'chờ xác nhận' },
    items: [{
        sku: { type: String },
        qty: { type: String },
        price: { type: String },
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Orders', Order);