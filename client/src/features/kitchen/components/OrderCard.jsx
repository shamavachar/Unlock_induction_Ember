import React from "react";
import { useDispatch } from "react-redux";
import {
  updateOrderStatusThunk,
  cancelOrderThunk,
} from "../../../store/slices/orderSlice";
import { Clock, CheckCircle2, Play, Flame, X, User, Phone } from "lucide-react";

export const OrderCard = ({ order }) => {
  const dispatch = useDispatch();

  const handleStatus = (nextStatus) => {
    dispatch(updateOrderStatusThunk({ id: order._id, status: nextStatus }));
  };

  const handleCancel = () => {
    const reason = window.prompt("Reason for cancelling order:");
    if (reason !== null) {
      dispatch(cancelOrderThunk({ id: order._id, reason }));
    }
  };

  // Calculate elapsed minutes since order creation
  const elapsedMinutes = Math.floor(
    (new Date() - new Date(order.createdAt)) / (1000 * 60)
  );

  return (
    <div
      className="card"
      style={{
        padding: "1rem",
        marginBottom: "0.85rem",
        borderLeft:
          order.status === "Waiting"
            ? "4px solid #0284c7"
            : order.status === "Preparing"
            ? "4px solid #f59e0b"
            : order.status === "Ready"
            ? "4px solid #10b981"
            : "4px solid #94a3b8",
      }}
    >
      {/* Top Card Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <span
          className="token-box"
          style={{ fontSize: "1.15rem", padding: "0.2rem 0.5rem" }}
        >
          {order.tokenNumber}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: elapsedMinutes > 15 ? "#dc2626" : "var(--color-text-muted)",
          }}
        >
          <Clock size={13} /> {elapsedMinutes}m ago
        </span>
      </div>

      {/* Student Details */}
      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
        <p style={{ fontWeight: 600, color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "4px" }}>
          <User size={13} /> {order.studentName} {order.studentRollNumber ? `(${order.studentRollNumber})` : ""}
        </p>
        {order.studentPhone && (
          <p style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
            <Phone size={12} /> {order.studentPhone}
          </p>
        )}
      </div>

      {/* Items List */}
      <div
        style={{
          background: "var(--color-bg-subtle)",
          padding: "0.5rem 0.75rem",
          borderRadius: "var(--radius-sm)",
          margin: "0.5rem 0",
          fontSize: "0.85rem",
        }}
      >
        {order.items?.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
              fontWeight: 600,
            }}
          >
            <span>
              <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>
                {item.quantity}x
              </span>{" "}
              {item.name}
            </span>
          </div>
        ))}

        {order.notes && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#b45309",
              marginTop: "0.35rem",
              fontStyle: "italic",
            }}
          >
            ⚠️ Note: "{order.notes}"
          </p>
        )}
      </div>

      {/* Action Buttons based on status */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        {order.status === "Waiting" && (
          <>
            <button
              onClick={() => handleStatus("Preparing")}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Flame size={14} /> Start Cooking
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-outline-danger btn-sm"
              title="Cancel Order"
            >
              <X size={14} />
            </button>
          </>
        )}

        {order.status === "Preparing" && (
          <>
            <button
              onClick={() => handleStatus("Ready")}
              className="btn btn-success btn-sm"
              style={{ flex: 1 }}
            >
              <CheckCircle2 size={14} /> Mark Ready
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-outline-danger btn-sm"
              title="Cancel Order"
            >
              <X size={14} />
            </button>
          </>
        )}

        {order.status === "Ready" && (
          <button
            onClick={() => handleStatus("Completed")}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontWeight: 700 }}
          >
            <CheckCircle2 size={14} /> Complete & Hand Over
          </button>
        )}
      </div>
    </div>
  );
};
