import React from "react";
import { StatusStepper } from "./StatusStepper";
import { StatusBadge } from "../../../components/common/Badge";
import { Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export const LiveTrackerCard = ({ order }) => {
  if (!order) return null;

  const isReady = order.status === "Ready";
  const isCompleted = order.status === "Completed";
  const isWaiting = order.status === "Waiting";
  const isPreparing = order.status === "Preparing";

  return (
    <div
      className="card"
      style={{
        border: isReady ? "2px solid #10b981" : "1px solid var(--color-border)",
        background: isReady ? "#f0fdf4" : "var(--color-bg-surface)",
      }}
    >

      {isReady && (
        <div
          style={{
            background: "#10b981",
            color: "#ffffff",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontWeight: 700,
          }}
        >
          <Sparkles size={22} />
          <div>
            <p style={{ fontSize: "1rem" }}>YOUR ORDER IS READY FOR PICKUP!</p>
            <p style={{ fontSize: "0.8rem", fontWeight: 500, opacity: 0.9 }}>
              Please show your token number at the canteen counter.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Order Token
          </span>
          <div style={{ marginTop: "0.25rem" }}>
            <span className="token-box">{order.tokenNumber}</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <StatusBadge status={order.status} />
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>
            Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {(isWaiting || isPreparing) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          <div
            style={{
              background: "var(--color-bg-subtle)",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Queue Position</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", marginTop: "0.15rem" }}>
              {order.queuePosition !== undefined ? `${order.queuePosition} ahead` : "In Queue"}
            </p>
          </div>

          <div
            style={{
              background: "var(--color-preparing-bg)",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              color: "var(--color-preparing-text)",
            }}
          >
            <p style={{ fontSize: "0.75rem" }}>Estimated Wait</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.15rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <Clock size={16} /> ~{order.estimatedWaitTime || 10} mins
            </p>
          </div>
        </div>
      )}

      <StatusStepper status={order.status} statusHistory={order.statusHistory} />

      <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-border)" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Items Ordered ({order.items?.length || 0})
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                padding: "0.3rem 0",
              }}
            >
              <span>
                <strong>{item.quantity}x</strong> {item.name}
              </span>
              <span style={{ fontWeight: 600 }}>₹{item.itemTotal || item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.75rem",
            paddingTop: "0.75rem",
            borderTop: "1px dashed var(--color-border)",
            fontWeight: 700,
          }}
        >
          <span>Total Paid ({order.paymentMethod})</span>
          <span style={{ color: "var(--color-primary)", fontSize: "1.05rem" }}>
            ₹{order.totalAmount}
          </span>
        </div>
      </div>
    </div>
  );
};
