const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────
// MenuItem Schema
//
// STOCK FLOW:  stockQuantity > 0  →  isAvailable = true
//              stockQuantity = 0  →  isAvailable = false  (Out of Stock)
//              Staff restocks     →  isAvailable = true   (back in menu)
// ─────────────────────────────────────────────────────────────────
const menuItemSchema = new mongoose.Schema(
    {
        // ── Identity ─────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, "Menu item name is required"],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },

        // ── Pricing & Category ────────────────────────────────────────
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [1, "Price must be at least ₹1"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["Snacks", "Meals", "Beverages", "Fast Food", "South Indian", "Desserts", "Other"],
            default: "Snacks",
        },

        // ── Display ───────────────────────────────────────────────────
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
        },
        isVeg: {
            type: Boolean,
            default: true,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },

        // ── Stock & Availability ──────────────────────────────────────
        // This is the heart of the stock flow:
        //   • Every order deducts from stockQuantity
        //   • When stockQuantity hits 0, isAvailable is auto-set false
        //   • Staff can manually restock (raises stockQuantity) or toggle isAvailable
        stockQuantity: {
            type: Number,
            default: 50,
            min: [0, "Stock cannot go below 0"],
        },
        isAvailable: {
            // Derived from stock but can also be toggled manually by staff
            // (e.g. staff can hide an item even when stock > 0)
            type: Boolean,
            default: true,
        },

        // ── Kitchen ───────────────────────────────────────────────────
        preparationTimeMinutes: {
            type: Number,
            default: 5,
            min: [1, "Preparation time must be at least 1 minute"],
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Full-text search on name + category filter
menuItemSchema.index({ name: "text" });
menuItemSchema.index({ category: 1, isAvailable: -1 });
menuItemSchema.index({ isAvailable: -1, isPopular: -1 });

// ── Pre-save hook: auto-sync isAvailable when stockQuantity hits 0 ─────────────
menuItemSchema.pre("save", function (next) {
    if (this.stockQuantity <= 0) {
        this.stockQuantity = 0;
        this.isAvailable = false;
    }
    next();
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
