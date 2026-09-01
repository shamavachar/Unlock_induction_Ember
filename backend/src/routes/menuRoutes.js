const express = require("express");
const router  = express.Router();

const {
    getMenuItems,
    getCategories,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    toggleAvailability,
    updateStock,
    deleteMenuItem,
    triggerChaosMode,
} = require("../controller/menuController");

const { protect, adminOnly } = require("../middleware/auth");

// ── Special routes BEFORE /:id ────────────────────────────────────────────────

// ORGANIZER: Chaos Mode — Admin only
router.post("/chaos-mode", protect, adminOnly, triggerChaosMode);

// STUDENT: Category filter tabs — Public
router.get("/categories", getCategories);

// ── Base routes ───────────────────────────────────────────────────────────────

router.route("/")
    .get(getMenuItems)                          // PUBLIC: Students view menu
    .post(protect, adminOnly, createMenuItem);  // ADMIN:  Add new item

// ── Item-specific routes ──────────────────────────────────────────────────────

router.route("/:id")
    .get(getMenuItemById)                        // PUBLIC: View item details
    .put(protect, adminOnly, updateMenuItem)     // ADMIN:  Edit item
    .delete(protect, adminOnly, deleteMenuItem); // ADMIN:  Remove item

// ADMIN: Quick availability toggle
router.patch("/:id/toggle", protect, adminOnly, toggleAvailability);

// ADMIN: Restock inventory count
router.patch("/:id/stock",  protect, adminOnly, updateStock);

module.exports = router;
