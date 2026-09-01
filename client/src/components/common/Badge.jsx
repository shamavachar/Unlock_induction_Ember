import React from "react";
import { ORDER_STATUS_COLORS } from "../../constants";

export const StatusBadge = ({ status }) => {
  const config = ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.Waiting;
  return (
    <span className={`badge ${config.badge}`}>
      {config.label || status}
    </span>
  );
};

export const VegBadge = ({ isVeg }) => {
  return (
    <span
      className={isVeg ? "badge-veg" : "badge-nonveg"}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
    />
  );
};

export const StockBadge = ({ stockQuantity, isAvailable }) => {
  if (!isAvailable || stockQuantity === 0) {
    return <span className="badge badge-cancelled">Sold Out</span>;
  }
  if (stockQuantity <= 5) {
    return <span className="badge badge-preparing">Only {stockQuantity} left</span>;
  }
  return <span className="badge badge-ready">In Stock ({stockQuantity})</span>;
};
