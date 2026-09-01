const Order = require("../models/Order");

const calculateEstimatedWaitTime = async (orderItems) => {
    try {

        const BASE_WAIT_MINUTES = 5;

        const activeOrders = await Order.find({
            status: { $in: ["Waiting", "Preparing"] }
        });

        let totalPendingItemsCount = 0;
        activeOrders.forEach(order => {
            order.items.forEach(item => {
                totalPendingItemsCount += item.quantity || 1;
            });
        });

        let newOrderItemsCount = 0;
        if (Array.isArray(orderItems)) {
            orderItems.forEach(item => {
                newOrderItemsCount += item.quantity || 1;
            });
        }

        const estimatedTime = Math.ceil(BASE_WAIT_MINUTES + (totalPendingItemsCount * 2) + (newOrderItemsCount * 1.5));
        return Math.max(5, Math.min(estimatedTime, 60)); 
    } catch (error) {
        console.error("Error calculating wait time:", error);
        return 10;
    }
};

const getQueuePosition = async (orderId, createdAt) => {
    try {

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
