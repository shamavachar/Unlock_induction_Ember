const { Server } = require("socket.io");

let io = null;

// ──────────────────────────────────────────────────────────────────────────────
// Initialize Socket.IO with the HTTP server
// Called once in server.js after the HTTP server is created
// ──────────────────────────────────────────────────────────────────────────────
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin:  "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Clients can join named rooms to get targeted updates:
        //   "staff"         → kitchen staff dashboard
        //   "display_board" → TV/pickup counter
        //   "token_CR-101"  → student tracking their specific order
        //   "order_<id>"    → alternative per-order room
        socket.on("join_room", (roomName) => {
            socket.join(roomName);
        });

        socket.on("leave_room", (roomName) => {
            socket.leave(roomName);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => io;

// ──────────────────────────────────────────────────────────────────────────────
// EVENT: New order placed (Student → Staff notification)
//   Emits to: ALL clients (staff dashboard, display board)
//   Payload: full order object with queuePosition
// ──────────────────────────────────────────────────────────────────────────────
const notifyNewOrder = (order) => {
    if (!io) return;
    io.emit("order:created", order);
    // Also trigger a queue refresh so display boards update counts
    io.emit("queue:updated", { reason: "new_order", tokenNumber: order.tokenNumber });
};

// ──────────────────────────────────────────────────────────────────────────────
// EVENT: Order status changed (Staff → Student notification)
//   Emits to: ALL clients (broad) + targeted rooms for the specific order
//   This is what makes the student tracking screen update in real-time
//
//   Status flow events:
//     Waiting   → order:status_updated + queue:updated
//     Preparing → order:status_updated + queue:updated
//     Ready     → order:status_updated (student gets "COLLECT NOW" notification)
//     Completed → order:status_updated
//     Cancelled → order:status_updated
// ──────────────────────────────────────────────────────────────────────────────
const notifyOrderStatusUpdated = (order) => {
    if (!io) return;

    const payload = {
        _id:         order._id,
        tokenNumber: order.tokenNumber,
        status:      order.status,
        studentName: order.studentName,
        statusHistory: order.statusHistory,
        preparingAt: order.preparingAt,
        readyAt:     order.readyAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
    };

    // Broadcast to ALL (staff dashboard needs this for order list refresh)
    io.emit("order:status_updated", payload);

    // Also emit to the specific order rooms (student tracking by token or id)
    io.to(`order_${order._id}`).emit("order:my_status_changed", payload);
    io.to(`token_${order.tokenNumber}`).emit("order:my_status_changed", payload);

    // Queue board always needs refreshing on any status change
    io.emit("queue:updated", {
        reason:      "status_change",
        tokenNumber: order.tokenNumber,
        newStatus:   order.status,
    });
};

// ──────────────────────────────────────────────────────────────────────────────
// EVENT: Stock changed on a menu item
//   Emits to: ALL clients (student menu page should update item availability)
//   Payload: minimal stock update object (not full item — saves bandwidth)
// ──────────────────────────────────────────────────────────────────────────────
const notifyStockUpdated = (menuItemData) => {
    if (!io) return;
    io.emit("menu:stock_updated", menuItemData);
};

// ──────────────────────────────────────────────────────────────────────────────
// EVENT: Canteen Chaos Mode activated
//   Emits to: ALL clients simultaneously
//   Triggers: alert banner, menu page reload, queue display update
// ──────────────────────────────────────────────────────────────────────────────
const notifyChaosAlert = (chaosData) => {
    if (!io) return;
    io.emit("canteen:chaos_alert", chaosData);
    io.emit("queue:updated", { reason: "chaos_mode" });
};

module.exports = {
    initSocket,
    getIO,
    notifyNewOrder,
    notifyOrderStatusUpdated,
    notifyStockUpdated,
    notifyChaosAlert,
};
