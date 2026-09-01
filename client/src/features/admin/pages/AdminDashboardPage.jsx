import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStatsThunk } from "../../../store/slices/statsSlice";
import { StatCards } from "../components/StatCards";
import { ChaosModeModal } from "../components/ChaosModeModal";
import { Loader } from "../../../components/common/Loader";
import { Button } from "../../../components/common/Button";
import { Link } from "react-router-dom";
import { BarChart3, Package, Zap, TrendingUp, RefreshCw, Layers } from "lucide-react";

export const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { today, inventory, isLoading, error } = useSelector((state) => state.stats);
  const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStatsThunk());
  }, [dispatch]);

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Top Header */}
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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Canteen Analytics & Operations</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Real-time kitchen metrics, rush stats, and inventory alerts
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant="danger"
            onClick={() => setIsChaosModalOpen(true)}
            icon={<Zap size={16} />}
          >
            Rush Hour Mode
          </Button>

          <Link to="/staff/inventory" className="btn btn-secondary">
            <Package size={16} /> Manage Stock
          </Link>

          <button
            onClick={() => dispatch(fetchDashboardStatsThunk())}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {isLoading && !today.totalOrders ? (
        <Loader message="Loading canteen analytics..." />
      ) : error ? (
        <div className="card" style={{ color: "var(--color-cancelled-text)", textAlign: "center", padding: "2rem" }}>
          {error}
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <StatCards today={today} inventory={inventory} />

          {/* 2-Column Section: Top Items + Low Stock Alert */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
            {/* Top Selling Items */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <TrendingUp size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Top Selling Items Today</h3>
              </div>

              {today.topSellingItems?.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                  No order data recorded yet today.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {today.topSellingItems?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        background: "var(--color-bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>
                        <strong>#{idx + 1}</strong> {item.name || item._id}
                      </span>
                      <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                        {item.totalSold} sold (₹{item.totalRevenue})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Warning Box */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Layers size={20} color="#dc2626" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Low Stock & Out of Stock Alerts</h3>
              </div>

              {inventory.lowStockItems?.length === 0 ? (
                <p style={{ color: "#16a34a", fontSize: "0.85rem", fontWeight: 500 }}>
                  ✓ All items are well stocked!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {inventory.lowStockItems?.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        background: item.stockQuantity === 0 ? "var(--color-cancelled-bg)" : "var(--color-preparing-bg)",
                        color: item.stockQuantity === 0 ? "var(--color-cancelled-text)" : "var(--color-preparing-text)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ fontWeight: 700 }}>
                        {item.stockQuantity === 0 ? "OUT OF STOCK" : `${item.stockQuantity} remaining`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Rush Hour Modal */}
      <ChaosModeModal
        isOpen={isChaosModalOpen}
        onClose={() => setIsChaosModalOpen(false)}
      />
    </div>
  );
};
