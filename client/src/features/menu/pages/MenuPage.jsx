import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMenuItemsThunk,
  fetchCategoriesThunk,
} from "../../../store/slices/menuSlice";
import { toggleCartDrawer } from "../../../store/slices/cartSlice";
import { MenuItemCard } from "../components/MenuItemCard";
import { CategoryFilter } from "../components/CategoryFilter";
import { SearchBar } from "../components/SearchBar";
import { Loader } from "../../../components/common/Loader";
import { ShoppingBag, Sparkles } from "lucide-react";

export const MenuPage = () => {
  const dispatch = useDispatch();
  const {
    items,
    selectedCategory,
    searchQuery,
    isVegOnly,
    availableOnly,
    isLoading,
    error,
  } = useSelector((state) => state.menu);

  const { totalItems, totalAmount, estimatedPrepTime } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (selectedCategory && selectedCategory !== "All") {
      params.category = selectedCategory;
    }
    if (isVegOnly) {
      params.isVeg = true;
    }
    if (availableOnly) {
      params.availableOnly = true;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    dispatch(fetchMenuItemsThunk(params));
  }, [dispatch, selectedCategory, isVegOnly, availableOnly, searchQuery]);

  return (
    <div style={{ paddingBottom: totalItems > 0 ? "5rem" : "2rem" }}>

      <div
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem 1.75rem",
          color: "#ffffff",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.2)",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              marginBottom: "0.5rem",
            }}
          >
            <Sparkles size={12} /> Campus Smart Canteen
          </span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
            Fresh Food, Zero Queue 🚀
          </h1>
          <p style={{ opacity: 0.9, fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Order ahead, get your real-time token, and pick up when fresh and ready.
          </p>
        </div>
      </div>

      <SearchBar />

      <div style={{ marginBottom: "1.5rem" }}>
        <CategoryFilter />
      </div>

      {isLoading ? (
        <Loader message="Loading fresh canteen menu..." />
      ) : error ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--color-cancelled-text)",
            background: "var(--color-cancelled-bg)",
          }}
        >
          <p>{error}</p>
          <button
            onClick={() => dispatch(fetchMenuItemsThunk())}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: "1rem" }}
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No food items found</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Try changing your search term or category filters.
          </p>
        </div>
      ) : (
        <div className="grid-responsive">
          {items.map((item) => (
            <MenuItemCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {totalItems > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 2rem)",
            maxWidth: "600px",
            background: "var(--color-text-main)",
            color: "#ffffff",
            borderRadius: "var(--radius-full)",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-lg)",
            zIndex: 45,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                {totalItems} {totalItems === 1 ? "Item" : "Items"} • ₹{totalAmount}
              </p>
              <p style={{ fontSize: "0.7rem", opacity: 0.75 }}>
                Est. Prep: ~{estimatedPrepTime} mins
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleCartDrawer(true))}
            className="btn btn-primary"
            style={{ borderRadius: "var(--radius-full)", padding: "0.45rem 1.1rem" }}
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
};
