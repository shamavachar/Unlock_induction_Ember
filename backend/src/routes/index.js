const express = require("express");
const router  = express.Router();

const authRoutes  = require("./authRoutes");
const menuRoutes  = require("./menuRoutes");
const orderRoutes = require("./orderRoutes");
const queueRoutes = require("./queueRoutes");
const statsRoutes = require("./statsRoutes");

// Mount all route groups
router.use("/auth",   authRoutes);
router.use("/menu",   menuRoutes);
router.use("/orders", orderRoutes);
router.use("/queue",  queueRoutes);
router.use("/stats",  statsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
    res.status(200).json({
        success:   true,
        message:   "Canteen Rush Manager API is running 🚀",
        timestamp: new Date(),
        endpoints: {
            // ── Auth ──────────────────────────────────────────────────
            studentSignup:    "POST   /api/auth/register",
            studentLogin:     "POST   /api/auth/login",
            adminLogin:       "POST   /api/auth/admin/login",
            myProfile:        "GET    /api/auth/me  [token required]",

            // ── Student (Public) ──────────────────────────────────────
            viewMenu:         "GET    /api/menu?availableOnly=true",
            categories:       "GET    /api/menu/categories",
            placeOrder:       "POST   /api/orders  [guest or token]",
            trackOrder:       "GET    /api/orders/track/:token",
            liveQueue:        "GET    /api/queue/live",

            // ── Admin Only (admin token required) ─────────────────────
            allOrders:        "GET    /api/orders  [admin]",
            updateStatus:     "PATCH  /api/orders/:id/status  [admin]",
            cancelOrder:      "PATCH  /api/orders/:id/cancel  [admin]",
            addItem:          "POST   /api/menu  [admin]",
            editItem:         "PUT    /api/menu/:id  [admin]",
            deleteItem:       "DELETE /api/menu/:id  [admin]",
            toggleStock:      "PATCH  /api/menu/:id/toggle  [admin]",
            restock:          "PATCH  /api/menu/:id/stock  [admin]",
            chaosMode:        "POST   /api/menu/chaos-mode  [admin]",
            dashboard:        "GET    /api/stats/dashboard  [admin]",
        },
    });
});

module.exports = router;
