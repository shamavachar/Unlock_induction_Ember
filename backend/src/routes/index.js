const express = require("express");
const router  = express.Router();

const menuRoutes  = require("./menuRoutes");
const orderRoutes = require("./orderRoutes");
const queueRoutes = require("./queueRoutes");
const statsRoutes = require("./statsRoutes");

// Mount all API route groups
router.use("/menu",   menuRoutes);
router.use("/orders", orderRoutes);
router.use("/queue",  queueRoutes);
router.use("/stats",  statsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
/**
 * @openapi
 * /health:
 *   get:
 *     summary: API health and endpoint check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is online and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Canteen Rush Manager API is running 🚀"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: object
 */
router.get("/health", (req, res) => {
    res.status(200).json({
        success:   true,
        message:   "Canteen Rush Manager API is running 🚀",
        timestamp: new Date(),
        endpoints: {
            // STUDENT
            viewMenu:    "GET    /api/menu?availableOnly=true&category=Snacks",
            categories:  "GET    /api/menu/categories",
            placeOrder:  "POST   /api/orders",
            trackOrder:  "GET    /api/orders/track/:tokenOrId",

            // STAFF
            allOrders:   "GET    /api/orders?status=active",
            updateStatus:"PATCH  /api/orders/:id/status",
            cancelOrder: "PATCH  /api/orders/:id/cancel",
            toggleItem:  "PATCH  /api/menu/:id/toggle",
            restock:     "PATCH  /api/menu/:id/stock",
            addItem:     "POST   /api/menu",

            // DISPLAY BOARD
            liveQueue:   "GET    /api/queue/live",
            dashboard:   "GET    /api/stats/dashboard",

            // ORGANIZER
            chaosMode:   "POST   /api/menu/chaos-mode",
        },
    });
});

module.exports = router;
