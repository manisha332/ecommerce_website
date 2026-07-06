const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
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
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);