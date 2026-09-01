import React from "react";
import { IndianRupee, ShoppingBag, Clock, AlertTriangle } from "lucide-react";

export const StatCards = ({ today = {}, inventory = {} }) => {
  const cards = [
    {
      title: "Today's Revenue",
      value: `₹${today.totalRevenue || 0}`,
      subtitle: "Gross earnings today",
      icon: IndianRupee,
      color: "#ea580c",
      bg: "var(--color-primary-light)",
    },
    {
      title: "Total Orders",
      value: today.totalOrders || 0,
      subtitle: "Orders placed today",
      icon: ShoppingBag,
      color: "#0284c7",
      bg: "#e0f2fe",
    },
    {
      title: "Active Queue Load",
      value: today.activeOrders || 0,
      subtitle: "Cooking & in queue",
      icon: Clock,
      color: "#b45309",
      bg: "var(--color-preparing-bg)",
    },
    {
      title: "Out of Stock Items",
      value: inventory.outOfStock || 0,
      subtitle: `${inventory.totalItems || 0} total menu items`,
      icon: AlertTriangle,
      color: "#dc2626",
      bg: "var(--color-cancelled-bg)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: card.bg,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconComponent size={24} />
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                {card.title}
              </span>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text-main)", lineHeight: 1.2 }}>
                {card.value}
              </p>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
