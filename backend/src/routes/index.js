const express = require("express");
const router  = express.Router();

const authRoutes  = require("./authRoutes");
const menuRoutes  = require("./menuRoutes");
const orderRoutes = require("./orderRoutes");
const queueRoutes = require("./queueRoutes");
const statsRoutes = require("./statsRoutes");

router.use("/auth",   authRoutes);
router.use("/menu",   menuRoutes);
router.use("/orders", orderRoutes);
router.use("/queue",  queueRoutes);
router.use("/stats",  statsRoutes);

router.get("/health", (req, res) => {
    res.status(200).json({
        success:   true,
        message:   "Canteen Rush Manager API is running 🚀",
        timestamp: new Date(),
        endpoints: {

            viewMenu:    "GET    /api/menu?availableOnly=true&category=Snacks",
            categories:  "GET    /api/menu/categories",
            placeOrder:  "POST   /api/orders",
            trackOrder:  "GET    /api/orders/track/:tokenOrId",

            allOrders:   "GET    /api/orders?status=active",
            updateStatus:"PATCH  /api/orders/:id/status",
            cancelOrder: "PATCH  /api/orders/:id/cancel",
            toggleItem:  "PATCH  /api/menu/:id/toggle",
            restock:     "PATCH  /api/menu/:id/stock",
            addItem:     "POST   /api/menu",

            liveQueue:   "GET    /api/queue/live",
            dashboard:   "GET    /api/stats/dashboard",

            chaosMode:   "POST   /api/menu/chaos-mode",
        },
    });
});

module.exports = router;
