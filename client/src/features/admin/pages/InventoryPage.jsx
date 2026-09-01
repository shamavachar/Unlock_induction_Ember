import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItemsThunk } from "../../../store/slices/menuSlice";
import { StockManagerTable } from "../components/StockManagerTable";
import { MenuItemModal } from "../components/MenuItemModal";
import { Loader } from "../../../components/common/Loader";
import { Button } from "../../../components/common/Button";
import { Plus, Search, Package, RefreshCw } from "lucide-react";

export const InventoryPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.menu);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    dispatch(fetchMenuItemsThunk());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: "3rem" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Canteen Food Inventory</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Real-time stock quantities, pricing, and availability management
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="primary" onClick={handleOpenAdd} icon={<Plus size={16} />}>
            Add Food Item
          </Button>

          <button
            onClick={() => dispatch(fetchMenuItemsThunk())}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem" }}>
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
          />
        </div>
      </div>

      <div className="card">
        {isLoading && items.length === 0 ? (
          <Loader message="Loading canteen inventory..." />
        ) : error ? (
          <div style={{ color: "var(--color-cancelled-text)", textAlign: "center", padding: "2rem" }}>
            {error}
          </div>
        ) : (
          <StockManagerTable items={filteredItems} onEditItem={handleOpenEdit} />
        )}
      </div>

      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
      />
    </div>
  );
};
