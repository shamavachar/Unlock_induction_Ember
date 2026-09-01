const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { setupSwagger } = require("./config/swagger");

const app = express();

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

setupSwagger(app);
app.get("/docs", (req, res) => res.redirect("/api-docs"));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
    res.json({
        name: "Canteen Rush Manager API",
        status: "Online",
        version: "1.0.0",
        documentation: "/api-docs",
        endpoints: {
            docs: "/api-docs",
            health: "/api/health",
            menu: "/api/menu",
            orders: "/api/orders",
            trackOrder: "/api/orders/track/:tokenOrId",
            liveQueue: "/api/queue/live",
            stats: "/api/stats/dashboard",
        },
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

app.use(errorHandler);

module.exports = app;
