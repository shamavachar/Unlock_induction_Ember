const express = require("express");
const router  = express.Router();

const {
    registerStudent,
    loginStudent,
    loginAdmin,
    getMe,
} = require("../controller/authController");

const { protect } = require("../middleware/auth");

// ── Student routes ────────────────────────────────────────────────────────────
router.post("/register", registerStudent); // Student signup
router.post("/login",    loginStudent);    // Student login

// ── Admin route ───────────────────────────────────────────────────────────────
router.post("/admin/login", loginAdmin);   // Admin/staff login (predefined creds)

// ── Protected: Get current logged-in user/admin profile ───────────────────────
router.get("/me", protect, getMe);

module.exports = router;
