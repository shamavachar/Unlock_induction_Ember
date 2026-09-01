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

const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

router.get("/track/:tokenOrId", trackOrder);

router.route("/")
    .post(optionalAuth, createOrder)  
    .get(protect, getOrders);         

router.route("/:id")
    .get(protect, adminOnly, getOrderById); 

router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

router.patch("/:id/cancel", protect, adminOnly, cancelOrder);

module.exports = router;
