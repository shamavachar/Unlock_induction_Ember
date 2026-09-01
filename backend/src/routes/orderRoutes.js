const express = require("express");
const router  = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
} = require("../controller/orderController");

const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

// ── Special routes BEFORE /:id ────────────────────────────────────────────────

// PUBLIC: Track order by token number (students check their order status)
// No auth needed — anyone with the token can track
router.get("/track/:tokenOrId", trackOrder);

// ── Base routes ───────────────────────────────────────────────────────────────

router.route("/")
    // PUBLIC (with optional auth): Place an order
    // optionalAuth → if logged in, req.user is available; if guest, still works
    .post(optionalAuth, createOrder)

    // ADMIN: View all orders with filters
    .get(protect, adminOnly, getOrders);

// ── Order-specific routes ─────────────────────────────────────────────────────

// ADMIN: Get single order details
router.get("/:id", protect, adminOnly, getOrderById);

// ADMIN: Move order through the flow — Waiting → Preparing → Ready → Completed
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

// ADMIN: Cancel order (stock automatically restored)
router.patch("/:id/cancel", protect, adminOnly, cancelOrder);

module.exports = router;
