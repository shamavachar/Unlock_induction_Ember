const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin:  "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

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

const notifyNewOrder = (order) => {
    if (!io) return;
    io.emit("order:created", order);

    io.emit("queue:updated", { reason: "new_order", tokenNumber: order.tokenNumber });
};

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

    io.emit("order:status_updated", payload);

    io.to(`order_${order._id}`).emit("order:my_status_changed", payload);
    io.to(`token_${order.tokenNumber}`).emit("order:my_status_changed", payload);

    io.emit("queue:updated", {
        reason:      "status_change",
        tokenNumber: order.tokenNumber,
        newStatus:   order.status,
    });
};

const notifyStockUpdated = (menuItemData) => {
    if (!io) return;
    io.emit("menu:stock_updated", menuItemData);
};

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
