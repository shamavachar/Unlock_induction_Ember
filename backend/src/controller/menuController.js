const MenuItem = require("../models/MenuItem");
const { notifyStockUpdated, notifyChaosAlert } = require("../sockets/socketHandler");

// ─────────────────────────────────────────────────────────────────────────────
//  MENU CONTROLLER
//
//  STOCK FLOW:
//    Staff adds item (stockQuantity > 0)  →  isAvailable = true
//    Order placed                         →  stockQuantity-- (atomic)
//    stockQuantity hits 0                 →  isAvailable = false  (Out of Stock)
//    Staff restocks via PATCH /:id/stock  →  isAvailable = true
//    Staff toggles  via PATCH /:id/toggle →  manual override
//
//  CHAOS TWIST (60-min hack twist):
//    POST /api/menu/chaos-mode            →  only 3 items remain in stock
// ─────────────────────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STUDENT: View available food menu
//         Returns all menu items with live stock status.
//         Query params:
//           ?availableOnly=true  – only show in-stock items (use for student order screen)
//           ?category=Snacks|Meals|Beverages|Fast Food|South Indian|Desserts|Other
//           ?isVeg=true|false
//           ?search=burger
// @route  GET /api/menu
// ──────────────────────────────────────────────────────────────────────────────
exports.getMenuItems = async (req, res, next) => {
    try {
        const { category, availableOnly, search, isVeg } = req.query;
        const query = {};

        // Filter: category
        if (category && category !== "All") {
            query.category = category;
        }

        // Filter: only show items students can actually order
        if (availableOnly === "true") {
            query.isAvailable   = true;
            query.stockQuantity = { $gt: 0 };
        }

        // Filter: veg / non-veg
        if (isVeg !== undefined) {
            query.isVeg = isVeg === "true";
        }

        // Filter: name search
        if (search && search.trim()) {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        // Sort: available first → popular first → alphabetical
        const items = await MenuItem.find(query).sort({
            isAvailable: -1,
            isPopular:   -1,
            name:         1,
        });

        return res.status(200).json({
            success: true,
            count:   items.length,
            data:    items,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get all available categories (for building filter tabs on the menu page)
// @route  GET /api/menu/categories
// ──────────────────────────────────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await MenuItem.distinct("category");
        return res.status(200).json({
            success: true,
            data:    ["All", ...categories.sort()],
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get single menu item by ID
// @route  GET /api/menu/:id
// ──────────────────────────────────────────────────────────────────────────────
exports.getMenuItemById = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }
        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Add a new food item to the menu
//         Sets isAvailable based on initial stockQuantity
// @route  POST /api/menu
// ──────────────────────────────────────────────────────────────────────────────
exports.createMenuItem = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stockQuantity,
            preparationTimeMinutes,
            isVeg,
            isPopular,
        } = req.body;

        const qty = Number(stockQuantity) || 50;

        const item = await MenuItem.create({
            name,
            description,
            price:                  Number(price),
            category,
            image,
            stockQuantity:          qty,
            isAvailable:            qty > 0,     // auto-derive availability from initial stock
            preparationTimeMinutes: Number(preparationTimeMinutes) || 5,
            isVeg:                  isVeg !== undefined ? Boolean(isVeg) : true,
            isPopular:              Boolean(isPopular) || false,
        });

        // Notify all clients that a new item appeared on the menu
        notifyStockUpdated(item);

        return res.status(201).json({
            success: true,
            message: `"${item.name}" added to the menu`,
            data:    item,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Update menu item details (name, price, description, etc.)
//         Automatically syncs isAvailable if stockQuantity is changed:
//           qty = 0  →  isAvailable = false
//           qty > 0  →  isAvailable = true (unless staff explicitly sets it false)
// @route  PUT /api/menu/:id
// ──────────────────────────────────────────────────────────────────────────────
exports.updateMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        // If stockQuantity is being changed, auto-sync isAvailable
        if (req.body.stockQuantity !== undefined) {
            const qty = Number(req.body.stockQuantity);
            req.body.stockQuantity = qty;
            if (qty <= 0) {
                req.body.stockQuantity = 0;
                req.body.isAvailable   = false; // force out of stock
            } else if (req.body.isAvailable === undefined) {
                req.body.isAvailable = true;    // bring back if restocked and not manually overridden
            }
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
            runValidators:  true,
        });

        notifyStockUpdated(updatedItem);

        return res.status(200).json({
            success: true,
            message: `"${updatedItem.name}" updated`,
            data:    updatedItem,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Instantly toggle an item available / out of stock
//         (One-tap button on staff dashboard to hide/show an item during rush)
//         NOTE: This only flips isAvailable — does NOT touch stockQuantity.
//               Use /stock endpoint to actually change inventory numbers.
// @route  PATCH /api/menu/:id/toggle
// ──────────────────────────────────────────────────────────────────────────────
exports.toggleAvailability = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        item.isAvailable = !item.isAvailable;
        await item.save();

        notifyStockUpdated({
            _id:           item._id,
            name:          item.name,
            stockQuantity: item.stockQuantity,
            isAvailable:   item.isAvailable,
        });

        return res.status(200).json({
            success: true,
            message: `"${item.name}" is now ${item.isAvailable ? "✅ Available" : "🚫 Out of Stock"}`,
            data:    item,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Restock / update stock quantity for an item
//         STOCK FLOW:
//           If qty > 0  → isAvailable = true  (item appears on student menu)
//           If qty = 0  → isAvailable = false (item disappears: Out of Stock)
// @route  PATCH /api/menu/:id/stock
// ──────────────────────────────────────────────────────────────────────────────
exports.updateStock = async (req, res, next) => {
    try {
        const qty = Number(req.body.stockQuantity);

        if (isNaN(qty) || qty < 0) {
            return res.status(400).json({
                success: false,
                message: "stockQuantity must be a non-negative number",
            });
        }

        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        const wasOutOfStock = !item.isAvailable || item.stockQuantity <= 0;

        item.stockQuantity = qty;
        item.isAvailable   = qty > 0; // auto-sync
        await item.save();

        notifyStockUpdated({
            _id:           item._id,
            name:          item.name,
            stockQuantity: item.stockQuantity,
            isAvailable:   item.isAvailable,
        });

        const msg = wasOutOfStock && qty > 0
            ? `"${item.name}" restocked to ${qty} portions — now Available`
            : qty === 0
            ? `"${item.name}" stock set to 0 — now Out of Stock`
            : `"${item.name}" stock updated to ${qty}`;

        return res.status(200).json({ success: true, message: msg, data: item });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   STAFF: Delete a menu item permanently
// @route  DELETE /api/menu/:id
// ──────────────────────────────────────────────────────────────────────────────
exports.deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        // Notify clients that this item no longer exists
        notifyStockUpdated({ _id: req.params.id, isDeleted: true });

        return res.status(200).json({
            success: true,
            message: `"${item.name}" removed from the menu`,
        });
    } catch (error) {
        next(error);
    }
};


// ──────────────────────────────────────────────────────────────────────────────
// @desc   ORGANIZER / STAFF: Trigger "CANTEEN CHAOS!" Mode (60-min Hack Twist)
//
//         "The canteen has only 3 food items remaining!"
//
//         What this does:
//           1. Marks ALL items as Out of Stock (stockQuantity = 0, isAvailable = false)
//           2. Keeps ONLY the specified (or auto-picked top-3) items available
//           3. Broadcasts chaos alert to every connected screen (menu, staff, display board)
//
//         Body params:
//           remainingItemIds   — array of item _ids to keep active (optional; auto-picks top 3)
//           stockPerItem       — how many portions each remaining item gets (default: 10)
//           message            — custom announcement text
// @route  POST /api/menu/chaos-mode
// ──────────────────────────────────────────────────────────────────────────────
exports.triggerChaosMode = async (req, res, next) => {
    try {
        const {
            remainingItemIds,
            stockPerItem = 10,
            message,
        } = req.body;

        let activeIds = remainingItemIds;

        // Auto-pick top 3 popular available items if none specified
        if (!Array.isArray(activeIds) || activeIds.length === 0) {
            const top3 = await MenuItem.find({ isAvailable: true })
                .sort({ isPopular: -1, name: 1 })
                .limit(3);
            activeIds = top3.map((i) => i._id.toString());
        }

        if (activeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No active items found to keep in stock for Chaos Mode",
            });
        }

        // Step 1: Mark EVERYTHING out of stock
        await MenuItem.updateMany(
            { _id: { $nin: activeIds } },
            { $set: { isAvailable: false, stockQuantity: 0 } }
        );

        // Step 2: Re-enable only the selected items
        await MenuItem.updateMany(
            { _id: { $in: activeIds } },
            { $set: { isAvailable: true, stockQuantity: Number(stockPerItem) || 10 } }
        );

        const remainingItems = await MenuItem.find({ _id: { $in: activeIds } })
            .select("name stockQuantity price category");

        const chaosPayload = {
            title:          "⚠️ CANTEEN CHAOS ALERT!",
            announcement:   message || `RUSH HOUR! Only ${activeIds.length} item(s) still available. Order fast!`,
            remainingCount: remainingItems.length,
            remainingItems: remainingItems.map((i) => ({
                id:       i._id,
                name:     i.name,
                stock:    i.stockQuantity,
                price:    i.price,
                category: i.category,
            })),
            triggeredAt: new Date(),
        };

        // Broadcast to ALL connected clients (menu page, staff, display board)
        notifyChaosAlert(chaosPayload);

        return res.status(200).json({
            success: true,
            message: "Canteen Chaos Mode ACTIVATED! Only the selected items are now available.",
            data:    chaosPayload,
        });
    } catch (error) {
        next(error);
    }
};
