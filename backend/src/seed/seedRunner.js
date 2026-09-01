const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const TokenCounter = require("../models/TokenCounter");
const menuItems = require("./seedData");

dotenv.config();

const seedDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/canteen_rush";
        console.log(`Connecting to MongoDB at: ${uri}`);
        await mongoose.connect(uri);

        console.log("Cleaning existing menu, order, and counter data...");
        await MenuItem.deleteMany({});
        await Order.deleteMany({});
        await TokenCounter.deleteMany({});

        console.log(`Inserting ${menuItems.length} menu items...`);
        const insertedItems = await MenuItem.insertMany(menuItems);
        console.log(`✅ Successfully seeded ${insertedItems.length} menu items!`);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
