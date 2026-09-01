import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity } from "../../../store/slices/cartSlice";
import { VegBadge, StockBadge } from "../../../components/common/Badge";
import { Plus, Minus, Clock } from "lucide-react";

export const MenuItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((i) => i.menuItemId === item._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = !item.isAvailable || item.stockQuantity <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const handleIncrement = () => {
    if (quantityInCart >= item.stockQuantity) return;
    dispatch(updateQuantity({ menuItemId: item._id, quantity: quantityInCart + 1 }));
  };

  const handleDecrement = () => {
    dispatch(updateQuantity({ menuItemId: item._id, quantity: quantityInCart - 1 }));
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: isOutOfStock ? 0.65 : 1,
        position: "relative",
        overflow: "hidden",
        border: quantityInCart > 0 ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
      }}
    >
      <div>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "160px",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background: "var(--color-bg-subtle)",
            marginBottom: "0.85rem",
          }}
        >
          <img
            src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            loading="lazy"
          />
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              display: "flex",
              gap: "6px",
              alignItems: "center",
              background: "rgba(255,255,255,0.9)",
              padding: "2px 6px",
              borderRadius: "var(--radius-full)",
            }}
          >
            <VegBadge isVeg={item.isVeg} />
            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{item.category}</span>
          </div>

          <div style={{ position: "absolute", top: "8px", right: "8px" }}>
            <StockBadge stockQuantity={item.stockQuantity} isAvailable={item.isAvailable} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-main)" }}>
            {item.name}
          </h4>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", whiteSpace: "nowrap" }}>
            ₹{item.price}
          </span>
        </div>

        {item.description && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
              marginTop: "0.3rem",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          <Clock size={14} /> ~{item.preparationTimeMinutes || 5} min
        </span>

        {isOutOfStock ? (
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-cancelled-text)" }}>
            Sold Out
          </span>
        ) : quantityInCart === 0 ? (
          <button
            onClick={handleAdd}
            className="btn btn-primary btn-sm"
            style={{ padding: "0.4rem 0.9rem" }}
          >
            <Plus size={14} /> Add
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--color-primary-light)",
              borderRadius: "var(--radius-full)",
              padding: "2px 6px",
            }}
          >
            <button
              onClick={handleDecrement}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "#fff",
                color: "var(--color-primary)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Minus size={14} />
            </button>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-primary)", minWidth: "16px", textAlign: "center" }}>
              {quantityInCart}
            </span>
            <button
              onClick={handleIncrement}
              disabled={quantityInCart >= item.stockQuantity}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: quantityInCart >= item.stockQuantity ? "var(--color-border)" : "#fff",
                color: "var(--color-primary)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
