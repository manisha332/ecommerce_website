const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    cart: [
        {
            productId: {
                type: Number,
                required: true
            },
            number: {
                type: Number,
                default: 1
            }
        }
    ],

    orders: [
        {
            productId: {
                type: Number,
                required: true
            },
            purchasedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model("User", userSchema);