import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSearchQuery, setIsVegOnly, setAvailableOnly } from "../../../store/slices/menuSlice";
import { Search, X } from "lucide-react";
import { VegBadge } from "../../../components/common/Badge";

export const SearchBar = () => {
  const dispatch = useDispatch();
  const { searchQuery, isVegOnly, availableOnly } = useSelector((state) => state.menu);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        marginBottom: "1rem",
      }}
    >
      {/* Search Input */}
      <div
        style={{
          position: "relative",
          flex: "1 1 260px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            color: "var(--color-text-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search foods, beverages, snacks..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="form-input"
          style={{ paddingLeft: "36px", paddingRight: searchQuery ? "32px" : "12px" }}
        />
        {searchQuery && (
          <button
            onClick={() => dispatch(setSearchQuery(""))}
            style={{
              position: "absolute",
              right: "10px",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toggles */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Veg Only Toggle */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            background: isVegOnly ? "#f0fdf4" : "var(--color-bg-surface)",
            padding: "0.45rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: isVegOnly ? "1px solid #bbf7d0" : "1px solid var(--color-border)",
            color: isVegOnly ? "#15803d" : "var(--color-text-muted)",
          }}
        >
          <input
            type="checkbox"
            checked={isVegOnly}
            onChange={(e) => dispatch(setIsVegOnly(e.target.checked))}
            style={{ display: "none" }}
          />
          <VegBadge isVeg={true} />
          <span>Veg Only</span>
        </label>

        {/* Available In-Stock Toggle */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            background: availableOnly ? "var(--color-primary-light)" : "var(--color-bg-surface)",
            padding: "0.45rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: availableOnly ? "1px solid #fed7aa" : "1px solid var(--color-border)",
            color: availableOnly ? "var(--color-primary)" : "var(--color-text-muted)",
          }}
        >
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => dispatch(setAvailableOnly(e.target.checked))}
            style={{ display: "none" }}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
