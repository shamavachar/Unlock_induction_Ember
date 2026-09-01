import React from "react";
import { OrderCard } from "./OrderCard";

export const KanbanColumn = ({ title, count, orders = [], color, icon }) => {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "280px",
        background: "var(--color-bg-main)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 160px)",
      }}
    >

      <div
        style={{
          padding: "0.85rem 1rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffffff",
          borderTopLeftRadius: "var(--radius-md)",
          borderTopRightRadius: "var(--radius-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {icon}
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color }}>{title}</h3>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            background: "var(--color-bg-subtle)",
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {count}
        </span>
      </div>

      <div
        style={{
          padding: "0.85rem",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {orders.length === 0 ? (
          <div
            style={{
              padding: "2rem 1rem",
              textAlign: "center",
              color: "var(--color-text-subtle)",
              fontSize: "0.85rem",
            }}
          >
            No orders in this column
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order._id} order={order} />)
        )}
      </div>
    </div>
  );
};
