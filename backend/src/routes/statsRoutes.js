const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getDashboardStats } = require("../controller/statsController");

// ADMIN: Dashboard analytics
router.get("/dashboard", protect, adminOnly, getDashboardStats);

module.exports = router;
