const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────
// Sub-schema: Individual ordered item snapshot (price locked at order time)
// ─────────────────────────────────────────────────────────────────
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
            // Price locked at the time of ordering (not live price)
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
            // price × quantity — pre-computed for fast display
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false } // No separate _id for embedded items
);

// ─────────────────────────────────────────────────────────────────
// Sub-schema: Status history — logs every status transition with timestamp
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// Main Order Schema
//
// FLOW: Waiting → Preparing → Ready → Completed
//                                   ↘ Cancelled (from any except Completed)
// ─────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
    {
        // ── Token & Student ──────────────────────────────────────────
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

        // ── Items & Billing ──────────────────────────────────────────
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

        // ── Order Status ─────────────────────────────────────────────
        status: {
            type: String,
            enum: ["Waiting", "Preparing", "Ready", "Completed", "Cancelled"],
            default: "Waiting",
            index: true,
        },
        // Full audit trail: every status change is recorded here
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },

        // ── Payment ──────────────────────────────────────────────────
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

        // ── Queue & Wait Time ────────────────────────────────────────
        estimatedWaitTime: {
            type: Number, // in minutes
            default: 10,
            min: 0,
        },

        // ── Extra Info ───────────────────────────────────────────────
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

        // ── Key Timestamps ───────────────────────────────────────────
        // createdAt / updatedAt from timestamps: true
        preparingAt:  { type: Date },
        readyAt:      { type: Date },
        completedAt:  { type: Date },
        cancelledAt:  { type: Date },
    },
    {
        timestamps: true, // adds createdAt + updatedAt automatically
    }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Fast lookup for staff dashboard (active orders sorted by arrival)
orderSchema.index({ status: 1, createdAt: 1 });

// ── Static helper: allowed next statuses ─────────────────────────────────────
orderSchema.statics.VALID_TRANSITIONS = {
    Waiting:    ["Preparing", "Cancelled"],
    Preparing:  ["Ready", "Cancelled"],
    Ready:      ["Completed", "Cancelled"],
    Completed:  [],           // terminal — no further transitions
    Cancelled:  [],           // terminal
};

orderSchema.statics.canTransition = function (from, to) {
    const allowed = this.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
