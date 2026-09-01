const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/statsController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/dashboard", protect, adminOnly, getDashboardStats);

module.exports = router;
