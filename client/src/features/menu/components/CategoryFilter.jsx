import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedCategory } from "../../../store/slices/menuSlice";

export const CategoryFilter = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategory } = useSelector((state) => state.menu);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        scrollbarWidth: "none",
      }}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => dispatch(setSelectedCategory(cat))}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: isSelected ? 600 : 500,
              background: isSelected ? "var(--color-primary)" : "var(--color-bg-surface)",
              color: isSelected ? "#ffffff" : "var(--color-text-muted)",
              border: isSelected ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
