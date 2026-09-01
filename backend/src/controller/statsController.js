const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get staff dashboard analytics
//         • Today's total orders & revenue
//         • Order breakdown by status (Waiting/Preparing/Ready/Completed/Cancelled)
//         • Top 5 best-selling items today
//         • Inventory: out-of-stock count, low-stock items
// @route  GET /api/stats/dashboard
// ──────────────────────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Start of today (midnight local → UTC)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            totalOrdersToday,
            statusAggregation,
            revenueAggregation,
            outOfStockCount,
            lowStockItems,
            totalMenuItems,
            topSellingItems,
        ] = await Promise.all([
            // Count all orders placed today
            Order.countDocuments({ createdAt: { $gte: todayStart } }),

            // Status breakdown
            Order.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // Revenue (exclude cancelled orders)
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: todayStart },
                        status:    { $ne: "Cancelled" },
                    },
                },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),

            // Count how many items are fully out of stock
            MenuItem.countDocuments({ $or: [{ isAvailable: false }, { stockQuantity: 0 }] }),

            // List items with 5 or fewer portions remaining (warn staff)
            MenuItem.find({ isAvailable: true, stockQuantity: { $gt: 0, $lte: 5 } })
                .select("name stockQuantity category")
                .sort({ stockQuantity: 1 }),

            // Total items on the menu
            MenuItem.countDocuments(),

            // Top 5 best-selling items today (by quantity sold)
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: todayStart },
                        status:    { $ne: "Cancelled" },
                    },
                },
                { $unwind: "$items" },
                {
                    $group: {
                        _id:           "$items.name",
                        totalSold:     { $sum: "$items.quantity" },
                        totalRevenue:  { $sum: "$items.itemTotal" },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
            ]),
        ]);

        // Build status map from aggregation result
        const statusBreakdown = {
            Waiting:   0,
            Preparing: 0,
            Ready:     0,
            Completed: 0,
            Cancelled: 0,
        };
        statusAggregation.forEach(({ _id, count }) => {
            if (_id in statusBreakdown) statusBreakdown[_id] = count;
        });

        const totalRevenue = revenueAggregation[0]?.total ?? 0;

        return res.status(200).json({
            success: true,
            data: {
                today: {
                    totalOrders:     totalOrdersToday,
                    totalRevenue,
                    statusBreakdown,
                    activeOrders:    statusBreakdown.Waiting + statusBreakdown.Preparing + statusBreakdown.Ready,
                    topSellingItems: topSellingItems.map((i) => ({
                        name:         i._id,
                        totalSold:    i.totalSold,
                        totalRevenue: i.totalRevenue,
                    })),
                },
                inventory: {
                    totalItems:     totalMenuItems,
                    outOfStock:     outOfStockCount,
                    lowStockItems:  lowStockItems.map((i) => ({
                        id:       i._id,
                        name:     i.name,
                        stock:    i.stockQuantity,
                        category: i.category,
                    })),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
