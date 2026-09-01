const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

// API Routes
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({
        name: "Canteen Rush Manager API",
        status: "Online",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            menu: "/api/menu",
            orders: "/api/orders",
            trackOrder: "/api/orders/track/:tokenOrId",
            liveQueue: "/api/queue/live",
            stats: "/api/stats/dashboard",
        },
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;