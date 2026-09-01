import React from "react";
import { useDispatch } from "react-redux";
import {
  toggleItemAvailabilityThunk,
  updateItemStockThunk,
  deleteMenuItemThunk,
} from "../../../store/slices/menuSlice";
import { VegBadge, StockBadge } from "../../../components/common/Badge";
import { Plus, Minus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export const StockManagerTable = ({ items = [], onEditItem }) => {
  const dispatch = useDispatch();

  const handleToggle = (id) => {
    dispatch(toggleItemAvailabilityThunk(id));
  };

  const handleStockChange = (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    dispatch(updateItemStockThunk({ id, stockQuantity: newStock, action: "set" }));
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch(deleteMenuItemThunk(id));
    }
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
            <th style={{ padding: "0.75rem 0.5rem" }}>Item</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Category</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Price</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Live Stock</th>
            <th style={{ padding: "0.75rem 0.5rem" }}>Availability</th>
            <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              style={{
                borderBottom: "1px solid var(--color-border)",
                opacity: !item.isAvailable ? 0.6 : 1,
              }}
            >
              {/* Item Details */}
              <td style={{ padding: "0.75rem 0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <VegBadge isVeg={item.isVeg} />
                  <div>
                    <strong style={{ color: "var(--color-text-main)" }}>{item.name}</strong>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Prep: {item.preparationTimeMinutes || 5} min
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-muted)" }}>
                {item.category}
              </td>

              {/* Price */}
              <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                ₹{item.price}
              </td>

              {/* Live Stock Stepper */}
              <td style={{ padding: "0.75rem 0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => handleStockChange(item._id, item.stockQuantity, -5)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 5px", fontSize: "0.7rem" }}
                    title="-5 stock"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleStockChange(item._id, item.stockQuantity, -1)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 6px" }}
                  >
                    <Minus size={12} />
                  </button>
                  <span
                    style={{
                      minWidth: "32px",
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                    }}
                  >
                    {item.stockQuantity}
                  </span>
                  <button
                    onClick={() => handleStockChange(item._id, item.stockQuantity, 1)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 6px" }}
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => handleStockChange(item._id, item.stockQuantity, 10)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 5px", fontSize: "0.7rem" }}
                    title="+10 stock"
                  >
                    +10
                  </button>
                </div>
              </td>

              {/* Availability Toggle */}
              <td style={{ padding: "0.75rem 0.5rem" }}>
                <button
                  onClick={() => handleToggle(item._id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                  title="Toggle item on/off menu"
                >
                  {item.isAvailable && item.stockQuantity > 0 ? (
                    <span style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.8rem" }}>
                      <ToggleRight size={22} /> Visible
                    </span>
                  ) : (
                    <span style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.8rem" }}>
                      <ToggleLeft size={22} /> Hidden
                    </span>
                  )}
                </button>
              </td>

              {/* Actions */}
              <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button
                    onClick={() => onEditItem(item)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Item"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
