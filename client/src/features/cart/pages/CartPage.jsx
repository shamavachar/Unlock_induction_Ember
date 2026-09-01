import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, setNotes } from "../../../store/slices/cartSlice";
import { CartItemRow } from "../components/CartItemRow";
import { Button } from "../../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Clock, Utensils, Trash2 } from "lucide-react";

export const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, notes, totalItems, totalAmount, estimatedPrepTime } = useSelector(
    (state) => state.cart
  );

  if (items.length === 0) {
    return (
      <div
        className="card"
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          textAlign: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <ShoppingBag size={54} color="var(--color-border-hover)" style={{ margin: "0 auto" }} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "1rem" }}>
          Your Tray is Empty
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Looks like you haven't added anything to eat yet.
        </p>
        <Link to="/menu" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
          <Utensils size={16} /> Explore Canteen Menu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Your Canteen Tray</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Review items before confirming your token
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="btn btn-outline-danger btn-sm"
        >
          <Trash2 size={14} /> Clear Tray
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        {items.map((item) => (
          <CartItemRow key={item.menuItemId} item={item} />
        ))}

        <div style={{ marginTop: "1.25rem" }}>
          <label className="form-label">Special instructions for kitchen (Optional):</label>
          <input
            type="text"
            placeholder="e.g. Extra napkins, less spicy, separate box"
            value={notes}
            onChange={(e) => dispatch(setNotes(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      {/* Bill & Summary Box */}
      <div className="card" style={{ background: "var(--color-bg-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--color-preparing-text)" }}>
          <Clock size={16} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            Estimated Prep Time: ~{estimatedPrepTime} minutes
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--color-text-muted)" }}>Total Items</span>
          <span style={{ fontWeight: 600 }}>{totalItems}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Total Payable</span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-primary)" }}>
            ₹{totalAmount}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/checkout")}
          style={{ width: "100%" }}
          icon={<ArrowRight size={18} />}
        >
          Proceed to Order Token
        </Button>
      </div>
    </div>
  );
};
