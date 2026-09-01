const MenuItem = require("../models/MenuItem");
const { notifyStockUpdated, notifyChaosAlert } = require("../sockets/socketHandler");

exports.getMenuItems = async (req, res, next) => {
    try {
        const { category, availableOnly, search, isVeg } = req.query;
        const query = {};

        if (category && category !== "All") {
            query.category = category;
        }

        if (availableOnly === "true") {
            query.isAvailable   = true;
            query.stockQuantity = { $gt: 0 };
        }

        if (isVeg !== undefined) {
            query.isVeg = isVeg === "true";
        }

        if (search && search.trim()) {
            query.name = { $regex: search.trim(), $options: "i" };
        }

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
            isAvailable:            qty > 0,     
            preparationTimeMinutes: Number(preparationTimeMinutes) || 5,
            isVeg:                  isVeg !== undefined ? Boolean(isVeg) : true,
            isPopular:              Boolean(isPopular) || false,
        });

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

exports.updateMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        if (req.body.stockQuantity !== undefined) {
            const qty = Number(req.body.stockQuantity);
            req.body.stockQuantity = qty;
            if (qty <= 0) {
                req.body.stockQuantity = 0;
                req.body.isAvailable   = false; 
            } else if (req.body.isAvailable === undefined) {
                req.body.isAvailable = true;    
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
        item.isAvailable   = qty > 0; 
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

exports.deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Menu item not found" });
        }

        notifyStockUpdated({ _id: req.params.id, isDeleted: true });

        return res.status(200).json({
            success: true,
            message: `"${item.name}" removed from the menu`,
        });
    } catch (error) {
        next(error);
    }
};

exports.triggerChaosMode = async (req, res, next) => {
    try {
        const {
            remainingItemIds,
            stockPerItem = 10,
            message,
        } = req.body;

        let activeIds = remainingItemIds;

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

        await MenuItem.updateMany(
            { _id: { $nin: activeIds } },
            { $set: { isAvailable: false, stockQuantity: 0 } }
        );

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
