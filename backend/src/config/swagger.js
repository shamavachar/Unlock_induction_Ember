const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Canteen Rush Manager API",
            version: "1.0.0",
            description:
                "High-speed canteen order management system with live queue tracking, stock inventory sync, and chaos mode support.\n\n" +
                "### Features:\n" +
                "- 🍔 **Menu Management & Live Stock Sync**: Auto out-of-stock when inventory reaches 0\n" +
                "- 🧾 **Token & Order Pipeline**: FIFO order tracking with dynamic queue position & wait time estimation\n" +
                "- 📺 **Live Queue Display Board**: Now Serving, Being Prepared, and Waiting in Queue\n" +
                "- 📊 **Kitchen & Staff Analytics**: Real-time revenue, order breakdowns, and low-stock alerts\n" +
                "- ⚡ **Canteen Chaos Mode**: Rapid rush hour twist handling\n",
            contact: {
                name: "Canteen Rush Manager Support",
            },
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Local API Server (Base path /api)",
            },
            {
                url: "http://localhost:5000",
                description: "Local Server Root",
            },
        ],
        tags: [
            {
                name: "Health",
                description: "API server health check",
            },
            {
                name: "Menu",
                description: "Menu item management, category filtering, stock updates, and chaos mode",
            },
            {
                name: "Orders",
                description: "Student ordering, token tracking, status transitions, and cancellations",
            },
            {
                name: "Queue",
                description: "Live TV display board and counter queue data",
            },
            {
                name: "Stats",
                description: "Staff dashboard analytics and inventory reports",
            },
        ],
        components: {
            schemas: {
                MenuItem: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "66d3a8e99999999999999991" },
                        name: { type: "string", example: "Crispy Veg Burger" },
                        description: { type: "string", example: "Crispy patty with fresh lettuce and mayo" },
                        price: { type: "number", example: 60 },
                        category: {
                            type: "string",
                            enum: ["Snacks", "Meals", "Beverages", "Fast Food", "South Indian", "Desserts", "Other"],
                            example: "Fast Food",
                        },
                        image: { type: "string", example: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" },
                        isVeg: { type: "boolean", example: true },
                        isPopular: { type: "boolean", example: true },
                        stockQuantity: { type: "number", example: 35 },
                        isAvailable: { type: "boolean", example: true },
                        preparationTimeMinutes: { type: "number", example: 7 },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                MenuItemInput: {
                    type: "object",
                    required: ["name", "price", "category"],
                    properties: {
                        name: { type: "string", example: "Paneer Butter Masala" },
                        description: { type: "string", example: "Rich creamy cottage cheese gravy" },
                        price: { type: "number", example: 120 },
                        category: {
                            type: "string",
                            enum: ["Snacks", "Meals", "Beverages", "Fast Food", "South Indian", "Desserts", "Other"],
                            example: "Meals",
                        },
                        image: { type: "string", example: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" },
                        stockQuantity: { type: "number", example: 25 },
                        preparationTimeMinutes: { type: "number", example: 10 },
                        isVeg: { type: "boolean", example: true },
                        isPopular: { type: "boolean", example: false },
                    },
                },
                OrderItem: {
                    type: "object",
                    properties: {
                        menuItem: { type: "string", example: "66d3a8e99999999999999991" },
                        name: { type: "string", example: "Crispy Veg Burger" },
                        price: { type: "number", example: 60 },
                        quantity: { type: "number", example: 2 },
                        itemTotal: { type: "number", example: 120 },
                    },
                },
                OrderItemInput: {
                    type: "object",
                    required: ["menuItemId", "quantity"],
                    properties: {
                        menuItemId: { type: "string", example: "66d3a8e99999999999999991" },
                        quantity: { type: "number", example: 2 },
                    },
                },
                OrderInput: {
                    type: "object",
                    required: ["studentName", "items"],
                    properties: {
                        studentName: { type: "string", example: "Rahul Sharma" },
                        studentPhone: { type: "string", example: "9876543210" },
                        studentRollNumber: { type: "string", example: "CS-2024-042" },
                        paymentMethod: {
                            type: "string",
                            enum: ["Cash", "UPI", "Card", "Wallet"],
                            example: "UPI",
                        },
                        notes: { type: "string", example: "Less spicy please" },
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/OrderItemInput",
                            },
                        },
                    },
                },
                StatusHistory: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            enum: ["Waiting", "Preparing", "Ready", "Completed", "Cancelled"],
                            example: "Waiting",
                        },
                        changedAt: { type: "string", format: "date-time" },
                        note: { type: "string", example: "Order placed" },
                    },
                },
                Order: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "66d3b1234567890123456789" },
                        tokenNumber: { type: "string", example: "CR-101" },
                        studentName: { type: "string", example: "Rahul Sharma" },
                        studentPhone: { type: "string", example: "9876543210" },
                        studentRollNumber: { type: "string", example: "CS-2024-042" },
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/OrderItem",
                            },
                        },
                        totalAmount: { type: "number", example: 120 },
                        status: {
                            type: "string",
                            enum: ["Waiting", "Preparing", "Ready", "Completed", "Cancelled"],
                            example: "Waiting",
                        },
                        statusHistory: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/StatusHistory",
                            },
                        },
                        paymentMethod: {
                            type: "string",
                            enum: ["Cash", "UPI", "Card", "Wallet"],
                            example: "UPI",
                        },
                        paymentStatus: {
                            type: "string",
                            enum: ["Pending", "Paid", "Cash on Counter"],
                            example: "Cash on Counter",
                        },
                        estimatedWaitTime: { type: "number", example: 12 },
                        queuePosition: { type: "number", example: 3 },
                        notes: { type: "string", example: "Less spicy please" },
                        cancellationReason: { type: "string", example: "" },
                        preparingAt: { type: "string", format: "date-time" },
                        readyAt: { type: "string", format: "date-time" },
                        completedAt: { type: "string", format: "date-time" },
                        cancelledAt: { type: "string", format: "date-time" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ApiResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Operation successful" },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Error details here" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js", "./src/routes/index.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const setupSwagger = (app) => {
    // Custom options for Swagger UI
    const customOptions = {
        customCss: `
            .swagger-ui .topbar { background-color: #0f172a; border-bottom: 2px solid #3b82f6; }
            .swagger-ui .topbar img { content: url('https://img.icons8.com/color/48/000000/restaurant-table.png'); }
            .swagger-ui .info .title { color: #1e293b; font-weight: 700; }
        `,
        customSiteTitle: "Canteen Rush Manager - API Docs",
    };

    // Serve interactive Swagger UI
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, customOptions));

    // Serve raw JSON spec
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
};

module.exports = {
    setupSwagger,
    swaggerSpec,
    swaggerUi,
};
