const http = require("http");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socketHandler");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start database and server
const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 Canteen Rush Manager Backend Running!`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
            console.log(`🔌 WebSockets: Ready for Real-Time Orders`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
});