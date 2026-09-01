const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {

            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
        itemTotal: {

            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false } 
);

const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["Waiting", "Preparing", "Ready", "Completed", "Cancelled"],
            required: true,
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
        note: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {

        tokenNumber: {
            type: String,
            required: [true, "Token number is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        studentName: {
            type: String,
            required: [true, "Student name is required"],
            trim: true,
        },
        studentPhone: {
            type: String,
            trim: true,
            default: "",
        },
        studentRollNumber: {
            type: String,
            trim: true,
            default: "",
        },

        items: {
            type: [orderItemSchema],
            validate: {
                validator: (val) => Array.isArray(val) && val.length > 0,
                message: "Order must contain at least one food item",
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total amount cannot be negative"],
        },

        status: {
            type: String,
            enum: ["Waiting", "Preparing", "Ready", "Completed", "Cancelled"],
            default: "Waiting",
            index: true,
        },

        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },

        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Wallet"],
            default: "Cash",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Cash on Counter"],
            default: "Cash on Counter",
        },

        estimatedWaitTime: {
            type: Number, 
            default: 10,
            min: 0,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
        cancellationReason: {
            type: String,
            trim: true,
            default: "",
        },

        preparingAt:  { type: Date },
        readyAt:      { type: Date },
        completedAt:  { type: Date },
        cancelledAt:  { type: Date },
    },
    {
        timestamps: true, 
    }
);

orderSchema.index({ status: 1, createdAt: 1 });

orderSchema.statics.VALID_TRANSITIONS = {
    Waiting:    ["Preparing", "Cancelled"],
    Preparing:  ["Ready", "Cancelled"],
    Ready:      ["Completed", "Cancelled"],
    Completed:  [],           
    Cancelled:  [],           
};

orderSchema.statics.canTransition = function (from, to) {
    const allowed = this.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
