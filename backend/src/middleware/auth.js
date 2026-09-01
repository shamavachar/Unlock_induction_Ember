const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────────────────────
// Auth Middleware
//
// protect    — Verify JWT; allow any logged-in user (student OR admin)
// adminOnly  — Allow ONLY admin role (canteen staff)
// optionalAuth — Attach user if token provided, but don't block if missing
// ─────────────────────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────────────────────
// protect — Must be logged in (student or admin)
//
// Usage: router.get("/my-orders", protect, getMyOrders)
//
// How to send token:
//   Header: Authorization: Bearer <token>
// ──────────────────────────────────────────────────────────────────────────────
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login to continue.",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id?, role, username? }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again.",
        });
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// adminOnly — Must be logged in as admin
//
// Usage: router.patch("/:id/status", protect, adminOnly, updateOrderStatus)
// ──────────────────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. This action requires canteen staff login.",
        });
    }
    next();
};


// ──────────────────────────────────────────────────────────────────────────────
// optionalAuth — Attach user if token is provided; don't block if missing
//
// Usage: router.post("/orders", optionalAuth, createOrder)
//   → Logged-in students get req.user set
//   → Guests (no token) can still place orders
// ──────────────────────────────────────────────────────────────────────────────
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            }
        }
    } catch {
        // Invalid/expired token — treat as guest, don't block
        req.user = null;
    }
    next();
};


module.exports = { protect, adminOnly, optionalAuth };
