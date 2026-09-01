const Order = require("../models/Order");

// ──────────────────────────────────────────────────────────────────────────────
// @desc   DISPLAY BOARD / TV: Get live queue data for the canteen counter
//
//         This powers:
//           • The large TV/display board at the canteen counter
//           • The staff dashboard queue summary
//           • Any "Now Serving" banner
//
//         Response structure:
//           ready     → Orders to be picked up RIGHT NOW (call student's name)
//           preparing → Orders the kitchen is currently cooking
//           waiting   → Orders in line waiting to be started
//           summary   → Active counts, average wait time
//
// @route  GET /api/queue/live
// ──────────────────────────────────────────────────────────────────────────────
exports.getLiveQueue = async (req, res, next) => {
    try {
        // Run all three queries in parallel for maximum speed
        const [readyOrders, preparingOrders, waitingOrders] = await Promise.all([
            // READY — student can pick up NOW
            Order.find({ status: "Ready" })
                .select("tokenNumber studentName items totalAmount readyAt estimatedWaitTime")
                .sort({ readyAt: -1 })
                .limit(10),

            // PREPARING — kitchen is working on these
            Order.find({ status: "Preparing" })
                .select("tokenNumber studentName items preparingAt estimatedWaitTime")
                .sort({ preparingAt: 1, createdAt: 1 })
                .limit(15),

            // WAITING — in queue, not started yet
            Order.find({ status: "Waiting" })
                .select("tokenNumber studentName items createdAt estimatedWaitTime totalAmount")
                .sort({ createdAt: 1 })  // FIFO — oldest order first
                .limit(20),
        ]);

        const totalActive = readyOrders.length + preparingOrders.length + waitingOrders.length;

        // Average wait estimate across all waiting orders
        const avgWait = waitingOrders.length > 0
            ? Math.round(
                waitingOrders.reduce((acc, o) => acc + (o.estimatedWaitTime || 10), 0)
                / waitingOrders.length
              )
            : 0;

        // Format orders for the display board — simple, clean output
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
                // "NOW SERVING" section on display board
                ready: formatForDisplay(readyOrders),

                // "BEING PREPARED" section
                preparing: formatForDisplay(preparingOrders),

                // "WAITING IN QUEUE" section
                waiting: formatForDisplay(waitingOrders),

                // Summary stats
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
