const express = require("express");
const router = express.Router();

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

// ── Special routes BEFORE /:id to avoid matching conflicts ────────────────────

// ORGANIZER: Activate Canteen Chaos Mode (60-min twist)
router.post("/chaos-mode", triggerChaosMode);

// STUDENT: Get all distinct categories for filter tabs
router.get("/categories", getCategories);

// ── Base routes ───────────────────────────────────────────────────────────────

router.route("/")
    .get(getMenuItems)      // STUDENT: View full menu
    .post(createMenuItem);  // STAFF:   Add new item

// ── Item-specific routes ──────────────────────────────────────────────────────

router.route("/:id")
    .get(getMenuItemById)   // STAFF/STUDENT: Get item details
    .put(updateMenuItem)    // STAFF:         Update item details
    .delete(deleteMenuItem);// STAFF:         Remove item from menu

// STAFF: Quick availability toggle (no stock change)
router.patch("/:id/toggle", toggleAvailability);

// STAFF: Restock / update inventory count
router.patch("/:id/stock",  updateStock);

module.exports = router;
