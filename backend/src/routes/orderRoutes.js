const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
} = require("../controller/orderController");

// ── Special routes BEFORE /:id ────────────────────────────────────────────────

// STUDENT: Track order by token number (e.g. CR-101) or Mongo ObjectId
// Must come before /:id to avoid "track" being treated as an id
router.get("/track/:tokenOrId", trackOrder);

// ── Base routes ───────────────────────────────────────────────────────────────

router.route("/")
    .post(createOrder)  // STUDENT: Place a new order
    .get(getOrders);    // STAFF:   View all orders (with filters)

// ── Order-specific routes ─────────────────────────────────────────────────────

router.route("/:id")
    .get(getOrderById); // STAFF/STUDENT: Get single order details

// STAFF: Move order through the flow — Waiting → Preparing → Ready → Completed
router.patch("/:id/status", updateOrderStatus);

// STAFF/STUDENT: Cancel order (stock is automatically restored)
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
