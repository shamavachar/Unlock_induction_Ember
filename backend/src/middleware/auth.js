const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────────────────────
// Auth Middleware
//
// protect      — Verify JWT; allow any logged-in user (student OR admin)
// adminOnly    — Allow ONLY admin role (canteen staff)
// optionalAuth — Attach user if token provided, but don't block guests
// ─────────────────────────────────────────────────────────────────────────────

// ── protect: Must be logged in (student or admin) ─────────────────────────────
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

// ── adminOnly: Must be logged in as admin ─────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. This action requires canteen staff (admin) login.",
        });
    }
    next();
};

// ── optionalAuth: Attach user if token is provided; don't block guests ────────
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
        req.user = null;
    }
    next();
};

module.exports = { protect, adminOnly, optionalAuth };
