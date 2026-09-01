const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {

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

        stockQuantity: {
            type: Number,
            default: 50,
            min: [0, "Stock cannot go below 0"],
        },
        isAvailable: {

            type: Boolean,
            default: true,
        },

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

menuItemSchema.index({ name: "text" });
menuItemSchema.index({ category: 1, isAvailable: -1 });
menuItemSchema.index({ isAvailable: -1, isPopular: -1 });

menuItemSchema.pre("save", function (next) {
    if (this.stockQuantity <= 0) {
        this.stockQuantity = 0;
        this.isAvailable = false;
    }
    next();
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
