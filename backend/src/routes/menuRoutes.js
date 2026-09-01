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

const { protect, adminOnly } = require("../middleware/auth");

router.post("/chaos-mode", protect, adminOnly, triggerChaosMode);

router.get("/categories", getCategories);

router.route("/")
    .get(getMenuItems)                          
    .post(protect, adminOnly, createMenuItem);  

router.route("/:id")
    .get(getMenuItemById)                        
    .put(protect, adminOnly, updateMenuItem)     
    .delete(protect, adminOnly, deleteMenuItem); 

router.patch("/:id/toggle", protect, adminOnly, toggleAvailability);

router.patch("/:id/stock",  protect, adminOnly, updateStock);

module.exports = router;
