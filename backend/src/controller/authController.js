const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: Generate JWT Token ────────────────────────────────────────────────
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

// ── Helper: Build safe user response (no password) ───────────────────────────
const userResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    rollNumber: user.rollNumber,
    role: user.role,
    createdAt: user.createdAt,
});

// ──────────────────────────────────────────────────────────────────────────────
// @desc   STUDENT: Register a new account
// @route  POST /api/auth/register
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.registerStudent = async (req, res, next) => {
    try {
        const { name, email, password, phone, rollNumber } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please login.",
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            phone: phone ? phone.trim() : "",
            rollNumber: rollNumber ? rollNumber.trim() : "",
            role: "student",
        });

        const token = generateToken({ id: user._id, role: "student" });

        return res.status(201).json({
            success: true,
            message: `Welcome, ${user.name}! Your student account has been created.`,
            token,
            user: userResponse(user),
        });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   STUDENT: Login with email + password
// @route  POST /api/auth/login
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.loginStudent = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken({ id: user._id, role: "student" });

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: userResponse(user),
        });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   ADMIN/STAFF: Login with predefined credentials
//         No signup — credentials configured in .env (ADMIN_USERNAME & ADMIN_PASSWORD)
// @route  POST /api/auth/admin/login
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const validUsername = process.env.ADMIN_USERNAME || "canteen_admin";
        const validPassword = process.env.ADMIN_PASSWORD || "admin@canteen123";

        const usernameMatch = username.trim() === validUsername;
        const passwordMatch = password === validPassword;

        if (!usernameMatch || !passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }

        const token = generateToken({ role: "admin", username: validUsername });

        return res.status(200).json({
            success: true,
            message: "Admin login successful. Welcome, Canteen Staff!",
            token,
            admin: {
                username: validUsername,
                role: "admin",
            },
        });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get currently logged-in user profile
// @route  GET /api/auth/me
// @access Protected (Student or Admin)
// ──────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
            return res.status(200).json({
                success: true,
                data: {
                    username: req.user.username,
                    role: "admin",
                },
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: userResponse(user),
        });
    } catch (error) {
        next(error);
    }
};
