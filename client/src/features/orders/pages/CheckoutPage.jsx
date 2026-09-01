import React from "react";
import { useSelector } from "react-redux";
import { CheckoutForm } from "../components/CheckoutForm";
import { Link, Navigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Clock } from "lucide-react";
import { VegBadge } from "../../../components/common/Badge";

export const CheckoutPage = () => {
  const { items, notes, totalItems, totalAmount, estimatedPrepTime } = useSelector(
    (state) => state.cart
  );

  if (items.length === 0) {
    return <Navigate to="/menu" replace />;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "0.5rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Complete Your Canteen Order</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
          We will generate your token instantly for pickup.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "flex-start" }}>

        <div>
          <CheckoutForm />
        </div>

        <div className="card" style={{ background: "var(--color-bg-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <ShoppingBag size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Order Summary ({totalItems})</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            {items.map((item) => (
              <div key={item.menuItemId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <VegBadge isVeg={item.isVeg} />
                  <span>
                    <strong>{item.quantity}x</strong> {item.name}
                  </span>
                </div>
                <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {notes && (
            <div
              style={{
                fontSize: "0.8rem",
                background: "#fff",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1rem",
                border: "1px solid var(--color-border)",
              }}
            >
              <strong>Note:</strong> {notes}
            </div>
          )}

          <div
            style={{
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.1rem",
              fontWeight: 800,
            }}
          >
            <span>Total:</span>
            <span style={{ color: "var(--color-primary)" }}>₹{totalAmount}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              color: "var(--color-preparing-text)",
              marginTop: "0.75rem",
            }}
          >
            <Clock size={14} /> Est. Kitchen Time: ~{estimatedPrepTime} mins
          </div>
        </div>
      </div>
    </div>
  );
};
