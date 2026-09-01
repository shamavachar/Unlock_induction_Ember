import React from "react";
import { useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "../../../store/slices/cartSlice";
import { Plus, Minus, Trash2 } from "lucide-react";
import { VegBadge } from "../../../components/common/Badge";

export const CartItemRow = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity + 1 }));
  };

  const handleDecrement = () => {
    dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.menuItemId));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "0.75rem 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
        <VegBadge isVeg={item.isVeg} />
        <div>
          <h5 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-main)" }}>
            {item.name}
          </h5>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            ₹{item.price} each
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "2px 4px",
          }}
        >
          <button
            onClick={handleDecrement}
            style={{
              padding: "3px",
              display: "flex",
              alignItems: "center",
              color: "var(--color-text-main)",
            }}
          >
            <Minus size={13} />
          </button>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            style={{
              padding: "3px",
              display: "flex",
              alignItems: "center",
              color: "var(--color-text-main)",
            }}
          >
            <Plus size={13} />
          </button>
        </div>

        <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "50px", textAlign: "right" }}>
          ₹{item.price * item.quantity}
        </span>

        <button
          onClick={handleRemove}
          title="Remove item"
          style={{
            color: "var(--color-text-subtle)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
