const Order = require("../models/Order");

/**
 * Calculates estimated wait time (in minutes) for a new order
 * based on pending orders currently in 'Waiting' and 'Preparing' status.
 */
const calculateEstimatedWaitTime = async (orderItems) => {
    try {
        // Average base time for kitchen parallel processing (e.g. 5 minutes minimum)
        const BASE_WAIT_MINUTES = 5;

        // Find all active pending orders
        const activeOrders = await Order.find({
            status: { $in: ["Waiting", "Preparing"] }
        });

        // Count total item quantities in queue
        let totalPendingItemsCount = 0;
        activeOrders.forEach(order => {
            order.items.forEach(item => {
                totalPendingItemsCount += item.quantity || 1;
            });
        });

        // Current order items count
        let newOrderItemsCount = 0;
        if (Array.isArray(orderItems)) {
            orderItems.forEach(item => {
                newOrderItemsCount += item.quantity || 1;
            });
        }

        // Formula: Base time + ~2.5 mins per pending item batch + 2 mins for current order
        const estimatedTime = Math.ceil(BASE_WAIT_MINUTES + (totalPendingItemsCount * 2) + (newOrderItemsCount * 1.5));
        return Math.max(5, Math.min(estimatedTime, 60)); // Cap between 5 and 60 minutes
    } catch (error) {
        console.error("Error calculating wait time:", error);
        return 10;
    }
};

/**
 * Get dynamic queue position of an active order
 */
const getQueuePosition = async (orderId, createdAt) => {
    try {
        // Orders created before this order that are still Waiting or Preparing
        const ordersAhead = await Order.countDocuments({
            status: { $in: ["Waiting", "Preparing"] },
            createdAt: { $lt: createdAt }
        });

        return ordersAhead + 1;
    } catch (error) {
        console.error("Error calculating queue position:", error);
        return 1;
    }
};

module.exports = {
    calculateEstimatedWaitTime,
    getQueuePosition
};
