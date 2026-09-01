const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const TokenCounter = require("../models/TokenCounter");
const { calculateEstimatedWaitTime, getQueuePosition } = require("../utils/queueEstimator");
const { notifyNewOrder, notifyOrderStatusUpdated, notifyStockUpdated } = require("../sockets/socketHandler");

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT FLOW
//  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
//  │  View Menu   │────▶│ Select Items │────▶│  POST /api/orders    │
//  └──────────────┘     └──────────────┘     └──────────┬───────────┘
//                                                        │
//                                            ┌───────────▼───────────┐
//                                            │  Validate Stock Live  │
//                                            │  Deduct Stock Atomic  │
//                                            │  Generate Token CR-## │
//                                            │  Calc Wait Time       │
//                                            │  Status = "Waiting"   │
//                                            └───────────┬───────────┘
//                                                        │ Socket → order:created
//                                            ┌───────────▼───────────┐
//                                            │  Track: GET /track/   │
//                                            │  token  →  status +   │
//                                            │  queue position       │
//                                            └───────────────────────┘
//
//  STAFF FLOW
//  Waiting → Preparing → Ready → Completed
//  (any non-terminal → Cancelled + stock restored)
//
//  STOCK FLOW
//  isAvailable=true & stock > 0  ─▶  order placed  ─▶  stock--
//  stock == 0  ─▶  isAvailable=false  ─▶  "Out of Stock" on menu
// ─────────────────────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STUDENT: Place a new food order
//         • Validates all items are in stock
//         • Atomically deducts stock (marks Out of Stock when stock hits 0)
//         • Generates unique daily token number (e.g. CR-101)
//         • Calculates estimated wait time based on current queue
//         • Broadcasts new order to staff via Socket.IO
// @route  POST /api/orders
// ──────────────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
    try {
        const {
            studentName,
            studentPhone,
            studentRollNumber,
            items,
            paymentMethod,
            notes,
        } = req.body;

        // ── Input validation ──────────────────────────────────────────
        if (!studentName || !studentName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Student name is required to place an order",
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one food item",
            });
        }

        // ── Fetch all requested menu items in one DB call ──────────────
        const itemIds = items.map((i) => i.menuItemId || i._id).filter(Boolean);
        if (itemIds.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: "Each item must have a valid menuItemId",
            });
        }

        const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
        const menuMap = new Map();
        dbMenuItems.forEach((item) => menuMap.set(item._id.toString(), item));

        // ── Validate stock for each item ──────────────────────────────
        const processedItems = [];
        let totalAmount = 0;

        for (const reqItem of items) {
            const id = (reqItem.menuItemId || reqItem._id || "").toString();
            const menuItem = menuMap.get(id);

            if (!menuItem) {
                return res.status(400).json({
                    success: false,
                    message: `Food item not found (ID: ${id}). It may have been removed.`,
                });
            }

            const requestedQty = Number(reqItem.quantity) || 1;

            // Check 1: Is the item marked available at all?
            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `"${menuItem.name}" is currently marked as Out of Stock by the canteen staff.`,
                });
            }

            // Check 2: Is there enough physical stock?
            if (menuItem.stockQuantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `"${menuItem.name}" has run out of stock. Please choose another item.`,
                });
            }

            if (menuItem.stockQuantity < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${menuItem.stockQuantity} portion(s) of "${menuItem.name}" available. You requested ${requestedQty}.`,
                });
            }

            const itemTotal = menuItem.price * requestedQty;
            totalAmount += itemTotal;

            processedItems.push({
                menuItem: menuItem._id,
                name:     menuItem.name,
                price:    menuItem.price,
                quantity: requestedQty,
                itemTotal,
            });
        }

        // ── Atomically deduct stock from MongoDB ──────────────────────
        // STOCK FLOW: stock-- → if stock == 0 → isAvailable = false → Out of Stock
        for (const item of processedItems) {
            // findOneAndUpdate with $inc is atomic — safe under concurrent orders
            let updatedItem = await MenuItem.findOneAndUpdate(
                {
                    _id: item.menuItem,
                    stockQuantity: { $gte: item.quantity }, // guard: only deduct if still enough
                    isAvailable: true,
                },
                { $inc: { stockQuantity: -item.quantity } },
                { returnDocument: "after" }
            );

            if (!updatedItem) {
                // Another concurrent order just grabbed the last stock
                return res.status(409).json({
                    success: false,
                    message: `"${item.name}" just sold out while your order was being processed. Please refresh the menu and try again.`,
                });
            }

            // If stock hit 0 → mark Out of Stock using another atomic update
            // (avoids calling .save() on a lean/raw doc which confuses the pre-save hook)
            if (updatedItem.stockQuantity <= 0) {
                updatedItem = await MenuItem.findByIdAndUpdate(
                    item.menuItem,
                    { $set: { stockQuantity: 0, isAvailable: false } },
                    { returnDocument: "after" }
                );
            }

            // Broadcast live stock change to all connected clients (menu page refreshes)
            notifyStockUpdated({
                _id:           updatedItem._id,
                name:          updatedItem.name,
                stockQuantity: updatedItem.stockQuantity,
                isAvailable:   updatedItem.isAvailable,
            });
        }

        // ── Generate unique token (CR-101, CR-102, …) ─────────────────
        const tokenNumber = await TokenCounter.getNextToken();

        // ── Calculate estimated wait time ─────────────────────────────
        const estimatedWaitTime = await calculateEstimatedWaitTime(processedItems);

        // ── Create the Order document ──────────────────────────────────
        const order = await Order.create({
            tokenNumber,
            studentName:       studentName.trim(),
            studentPhone:      studentPhone       ? studentPhone.trim()       : "",
            studentRollNumber: studentRollNumber  ? studentRollNumber.trim()  : "",
            items:             processedItems,
            totalAmount,
            status:            "Waiting",
            statusHistory: [{ status: "Waiting", note: "Order placed by student" }],
            paymentMethod:  paymentMethod || "Cash",
            paymentStatus:  paymentMethod === "UPI" ? "Paid" : "Cash on Counter",
            estimatedWaitTime,
            notes: notes || "",
        });

        // ── Compute initial queue position ─────────────────────────────
        const queuePosition = await getQueuePosition(order._id, order.createdAt);

        const responseData = { ...order.toObject(), queuePosition };

        // ── Broadcast to staff dashboard & display board ───────────────
        notifyNewOrder(responseData);

        return res.status(201).json({
            success: true,
            message: `Order placed! Your token is ${tokenNumber}. Estimated wait: ~${estimatedWaitTime} min.`,
            data:    responseData,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF / STUDENT: Get all orders with filters
//         Supports: ?status=Waiting|Preparing|Ready|Completed|Cancelled|active|All
//                   ?search=CR-101 or student name or roll number
//                   ?page=1&limit=50
// @route  GET /api/orders
// ──────────────────────────────────────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
    try {
        const { status, search, limit = 50, page = 1 } = req.query;
        const query = {};

        if (status) {
            if (status === "active") {
                // Active = anything the kitchen is still working on
                query.status = { $in: ["Waiting", "Preparing", "Ready"] };
            } else if (status !== "All") {
                query.status = status;
            }
        }

        if (search && search.trim()) {
            const s = search.trim();
            query.$or = [
                { tokenNumber:      { $regex: s, $options: "i" } },
                { studentName:      { $regex: s, $options: "i" } },
                { studentRollNumber: { $regex: s, $options: "i" } },
            ];
        }

        // If a student is fetching orders, scope to their own orders only
        if (req.user && req.user.role === "student") {
            const studentUser = await User.findById(req.user.id);
            if (studentUser) {
                const userOrFilters = [
                    { studentName: studentUser.name },
                ];
                if (studentUser.rollNumber) {
                    userOrFilters.push({ studentRollNumber: studentUser.rollNumber });
                }
                if (studentUser.phone) {
                    userOrFilters.push({ studentPhone: studentUser.phone });
                }

                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        { $or: userOrFilters }
                    ];
                    delete query.$or;
                } else {
                    query.$or = userOrFilters;
                }
            }
        }

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            count:   orders.length,
            total,
            page:    Number(page),
            pages:   Math.ceil(total / Number(limit)),
            data:    orders,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get a single order by Mongo ID
// @route  GET /api/orders/:id
// ──────────────────────────────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        let queuePosition = 0;
        if (["Waiting", "Preparing"].includes(order.status)) {
            queuePosition = await getQueuePosition(order._id, order.createdAt);
        }

        return res.status(200).json({
            success: true,
            data: { ...order.toObject(), queuePosition },
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STUDENT: Track order by Token Number (CR-101) OR Mongo ObjectId
//         Returns status, queue position, and wait time estimate
// @route  GET /api/orders/track/:tokenOrId
// ──────────────────────────────────────────────────────────────────────────────
exports.trackOrder = async (req, res, next) => {
    try {
        const { tokenOrId } = req.params;
        let order;

        // Try ObjectId first
        if (/^[0-9a-fA-F]{24}$/.test(tokenOrId)) {
            order = await Order.findById(tokenOrId);
        }

        // Fallback: token number (case-insensitive)
        if (!order) {
            order = await Order.findOne({
                tokenNumber: { $regex: `^${tokenOrId.trim()}$`, $options: "i" },
            });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `No order found with token/ID "${tokenOrId}". Double-check your token number.`,
            });
        }

        let queuePosition = 0;
        if (["Waiting", "Preparing"].includes(order.status)) {
            queuePosition = await getQueuePosition(order._id, order.createdAt);
        }

        return res.status(200).json({
            success: true,
            data: {
                ...order.toObject(),
                queuePosition,
                // Friendly status message for student UI
                statusMessage: getStatusMessage(order.status, order.tokenNumber, queuePosition),
            },
        });
    } catch (error) {
        next(error);
    }
};

/** Returns a human-friendly status description for the student tracking screen */
function getStatusMessage(status, token, queuePosition) {
    switch (status) {
        case "Waiting":
            return queuePosition <= 1
                ? `Your order (${token}) is next! Kitchen will start preparing soon.`
                : `Your order (${token}) is #${queuePosition} in queue. Please wait.`;
        case "Preparing":
            return `Your order (${token}) is being prepared by the kitchen. Almost there!`;
        case "Ready":
            return `Your order (${token}) is READY! Please collect from the counter.`;
        case "Completed":
            return `Order (${token}) completed. Enjoy your food!`;
        case "Cancelled":
            return `Order (${token}) was cancelled.`;
        default:
            return `Order status: ${status}`;
    }
}


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Update order status
//         Enforces strict transition rules:
//           Waiting  → Preparing | Cancelled
//           Preparing → Ready    | Cancelled
//           Ready    → Completed | Cancelled
//           Completed / Cancelled → (terminal, no changes allowed)
//
//         Broadcasts real-time Socket.IO event to student tracking screens.
// @route  PATCH /api/orders/:id/status
// ──────────────────────────────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "New status is required in request body",
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // ── Enforce valid transition ───────────────────────────────────
        if (!Order.canTransition(order.status, status)) {
            const allowed = Order.VALID_TRANSITIONS[order.status];
            return res.status(400).json({
                success: false,
                message: allowed.length
                    ? `Cannot move from "${order.status}" to "${status}". Allowed next statuses: ${allowed.join(", ")}.`
                    : `Order is already "${order.status}" — a terminal state. No further changes allowed.`,
            });
        }

        // ── Apply the status change ────────────────────────────────────
        const prevStatus = order.status;
        const now = new Date();

        order.status = status;
        order.statusHistory.push({
            status,
            changedAt: now,
            note: note || `Status changed from ${prevStatus} to ${status}`,
        });

        // Record the key timestamps
        if (status === "Preparing")  order.preparingAt  = now;
        if (status === "Ready")      order.readyAt      = now;
        if (status === "Completed") {
            order.completedAt  = now;
            order.paymentStatus = "Paid";
        }
        if (status === "Cancelled") {
            order.cancelledAt = now;
        }

        await order.save();

        // ── Broadcast to student tracking & staff board ────────────────
        notifyOrderStatusUpdated(order);

        return res.status(200).json({
            success: true,
            message: `Order ${order.tokenNumber} moved to "${status}"`,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF / STUDENT: Cancel an order
//         • Cannot cancel a Completed order
//         • Restores stock for all items in the order
//         • Broadcasts cancellation via Socket.IO
// @route  PATCH /api/orders/:id/cancel
// ──────────────────────────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!Order.canTransition(order.status, "Cancelled")) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an order that is already "${order.status}".`,
            });
        }

        // ── Restore stock for every item ──────────────────────────────
        // STOCK FLOW (reverse): stock++ → if was 0 → isAvailable = true again
        for (const item of order.items) {
            const updatedItem = await MenuItem.findByIdAndUpdate(
                item.menuItem,
                {
                    $inc: { stockQuantity: item.quantity },
                    $set: { isAvailable: true },
                },
                { returnDocument: "after" }
            );
            if (updatedItem) {
                notifyStockUpdated({
                    _id:           updatedItem._id,
                    name:          updatedItem.name,
                    stockQuantity: updatedItem.stockQuantity,
                    isAvailable:   updatedItem.isAvailable,
                });
            }
        }

        // ── Update order ───────────────────────────────────────────────
        const now = new Date();
        order.status             = "Cancelled";
        order.cancellationReason = reason || "Cancelled";
        order.cancelledAt        = now;
        order.statusHistory.push({
            status:    "Cancelled",
            changedAt: now,
            note:      reason || "Order cancelled",
        });
        await order.save();

        notifyOrderStatusUpdated(order);

        return res.status(200).json({
            success: true,
            message: `Order ${order.tokenNumber} cancelled and stock restored successfully`,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};
