import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleCartDrawer,
  clearCart,
  setNotes,
} from "../../../store/slices/cartSlice";
import { CartItemRow } from "./CartItemRow";
import { Button } from "../../../components/common/Button";
import { X, ShoppingBag, Clock, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, notes, totalItems, totalAmount, estimatedPrepTime, isDrawerOpen } =
    useSelector((state) => state.cart);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    dispatch(toggleCartDrawer(false));
    navigate("/checkout");
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => dispatch(toggleCartDrawer(false))}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>

        <div className="cart-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Your Canteen Tray</h3>
            <span className="badge badge-waiting">{totalItems} items</span>
          </div>
          <button
            onClick={() => dispatch(toggleCartDrawer(false))}
            style={{ padding: "4px", color: "var(--color-text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                textAlign: "center",
              }}
            >
              <ShoppingBag size={48} strokeWidth={1.5} color="var(--color-border-hover)" />
              <p style={{ marginTop: "1rem", fontWeight: 600 }}>Your tray is empty</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Add some tasty bites from the canteen menu!
              </p>
            </div>
          ) : (
            <>
              <div>
                {items.map((item) => (
                  <CartItemRow key={item.menuItemId} item={item} />
                ))}
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>
                  Special Instructions for Kitchen:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra sauce, separate packaging"
                  value={notes}
                  onChange={(e) => dispatch(setNotes(e.target.value))}
                  className="form-input"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "var(--color-preparing-bg)",
                  color: "var(--color-preparing-text)",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                }}
              >
                <Clock size={16} />
                <span>Estimated kitchen preparation: ~{estimatedPrepTime} minutes</span>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Subtotal</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>₹{totalAmount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                ₹{totalAmount}
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => dispatch(clearCart())}
                className="btn btn-secondary btn-sm"
                title="Clear Cart"
              >
                <Trash2 size={16} />
              </button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                style={{ flex: 1 }}
                icon={<ArrowRight size={16} />}
              >
                Proceed to Checkout (₹{totalAmount})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
