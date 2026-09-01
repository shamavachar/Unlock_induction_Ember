const Order = require("../models/Order");

exports.getLiveQueue = async (req, res, next) => {
    try {

        const [readyOrders, preparingOrders, waitingOrders] = await Promise.all([

            Order.find({ status: "Ready" })
                .select("tokenNumber studentName items totalAmount readyAt estimatedWaitTime")
                .sort({ readyAt: -1 })
                .limit(10),

            Order.find({ status: "Preparing" })
                .select("tokenNumber studentName items preparingAt estimatedWaitTime")
                .sort({ preparingAt: 1, createdAt: 1 })
                .limit(15),

            Order.find({ status: "Waiting" })
                .select("tokenNumber studentName items createdAt estimatedWaitTime totalAmount")
                .sort({ createdAt: 1 })  
                .limit(20),
        ]);

        const totalActive = readyOrders.length + preparingOrders.length + waitingOrders.length;

        const avgWait = waitingOrders.length > 0
            ? Math.round(
                waitingOrders.reduce((acc, o) => acc + (o.estimatedWaitTime || 10), 0)
                / waitingOrders.length
              )
            : 0;

        const formatForDisplay = (orders) =>
            orders.map((o) => ({
                tokenNumber: o.tokenNumber,
                studentName: o.studentName,
                itemCount:   o.items.reduce((sum, i) => sum + i.quantity, 0),
                itemSummary: o.items.map((i) => `${i.name} ×${i.quantity}`).join(", "),
                totalAmount: o.totalAmount,
                estimatedWaitTime: o.estimatedWaitTime,
            }));

        return res.status(200).json({
            success: true,
            data: {

                ready: formatForDisplay(readyOrders),

                preparing: formatForDisplay(preparingOrders),

                waiting: formatForDisplay(waitingOrders),

                summary: {
                    totalActive,
                    readyCount:     readyOrders.length,
                    preparingCount: preparingOrders.length,
                    waitingCount:   waitingOrders.length,
                    averageWaitMinutes: avgWait,
                },

                lastUpdated: new Date(),
            },
        });
    } catch (error) {
        next(error);
    }
};
