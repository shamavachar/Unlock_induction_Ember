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

/**
 * @openapi
 * /menu/chaos-mode:
 *   post:
 *     summary: Trigger Canteen Chaos Mode (Hack twist)
 *     description: Marks non-selected items out of stock and keeps only top/selected items with limited stock, broadcasting chaos alerts in real-time.
 *     tags: [Menu]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remainingItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific menu item IDs to keep in stock (defaults to top 3 popular items if omitted)
 *               stockPerItem:
 *                 type: number
 *                 default: 10
 *                 description: Inventory portions assigned to remaining items
 *               message:
 *                 type: string
 *                 example: "RUSH HOUR! Only 3 items left!"
 *     responses:
 *       200:
 *         description: Chaos mode activated successfully
 *       400:
 *         description: Bad request
 */
router.post("/chaos-mode", triggerChaosMode);

/**
 * @openapi
 * /menu/categories:
 *   get:
 *     summary: Get all distinct menu categories
 *     description: Returns category list prefixed with 'All' for student menu tab filtering.
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["All", "Beverages", "Fast Food", "Meals", "Snacks", "South Indian"]
 */
router.get("/categories", getCategories);

// ── Base routes ───────────────────────────────────────────────────────────────

/**
 * @openapi
 * /menu:
 *   get:
 *     summary: List all menu items with live stock & filters
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g. Snacks, Meals, Fast Food, South Indian)
 *       - in: query
 *         name: availableOnly
 *         schema:
 *           type: boolean
 *         description: If true, only returns items that are available and have stock > 0
 *       - in: query
 *         name: isVeg
 *         schema:
 *           type: boolean
 *         description: Filter by vegetarian (true) or non-vegetarian (false)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by menu item name
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *   post:
 *     summary: Add a new food item to the menu (Staff)
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItemInput'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '"Paneer Butter Masala" added to the menu'
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 */
router.route("/")
    .get(getMenuItems)      // STUDENT: View full menu
    .post(createMenuItem);  // STAFF:   Add new item

// ── Item-specific routes ──────────────────────────────────────────────────────

/**
 * @openapi
 * /menu/{id}:
 *   get:
 *     summary: Get single menu item by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item MongoDB ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 *   put:
 *     summary: Update menu item details (Staff)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItemInput'
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       404:
 *         description: Menu item not found
 *   delete:
 *     summary: Remove item from menu (Staff)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item MongoDB ID
 *     responses:
 *       200:
 *         description: Menu item removed successfully
 *       404:
 *         description: Menu item not found
 */
router.route("/:id")
    .get(getMenuItemById)   // STAFF/STUDENT: Get item details
    .put(updateMenuItem)    // STAFF:         Update item details
    .delete(deleteMenuItem);// STAFF:         Remove item from menu

/**
 * @openapi
 * /menu/{id}/toggle:
 *   patch:
 *     summary: Quick toggle item availability (Staff)
 *     description: Instantly flips isAvailable status without changing stock quantity.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability toggled
 *       404:
 *         description: Menu item not found
 */
router.patch("/:id/toggle", toggleAvailability);

/**
 * @openapi
 * /menu/{id}/stock:
 *   patch:
 *     summary: Restock / update inventory count (Staff)
 *     description: Updates stockQuantity. Setting stock > 0 automatically makes the item available; setting 0 marks it out of stock.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stockQuantity]
 *             properties:
 *               stockQuantity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Invalid stock number
 *       404:
 *         description: Menu item not found
 */
router.patch("/:id/stock",  updateStock);

module.exports = router;
