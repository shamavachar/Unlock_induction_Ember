import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffOrdersThunk } from "../../../store/slices/orderSlice";
import { socketService } from "../../../services/socketService";
import { KanbanColumn } from "../components/KanbanColumn";
import { Loader } from "../../../components/common/Loader";
import { Clock, Flame, Bell, CheckCircle2, RefreshCw, Volume2, VolumeX, Search } from "lucide-react";

export const KitchenKanbanPage = () => {
  const dispatch = useDispatch();
  const { staffOrders, isLoading, error } = useSelector((state) => state.orders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchStaffOrdersThunk({ status: "active", limit: 100 }));
    socketService.joinRoom("staff");

    return () => {
      socketService.leaveRoom("staff");
    };
  }, [dispatch]);

  // Filter orders by search term
  const filteredOrders = staffOrders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.tokenNumber?.toLowerCase().includes(term) ||
      order.studentName?.toLowerCase().includes(term) ||
      order.studentRollNumber?.toLowerCase().includes(term)
    );
  });

  const waitingOrders = filteredOrders.filter((o) => o.status === "Waiting");
  const preparingOrders = filteredOrders.filter((o) => o.status === "Preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "Ready");
  const completedOrders = filteredOrders.filter((o) => o.status === "Completed");

  return (
    <div style={{ paddingBottom: "2rem" }}>
      {/* Top Operations Control Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Kitchen Display System (KDS)</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Real-time live queue management • {filteredOrders.length} active orders
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Quick Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Filter token / student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", fontSize: "0.85rem", width: "200px" }}
            />
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary btn-sm"
            title={soundEnabled ? "Mute alert chimes" : "Unmute alert chimes"}
          >
            {soundEnabled ? <Volume2 size={16} color="#16a34a" /> : <VolumeX size={16} color="#dc2626" />}
          </button>

          <button
            onClick={() => dispatch(fetchStaffOrdersThunk({ status: "active", limit: 100 }))}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Kanban Columns Grid */}
      {isLoading && staffOrders.length === 0 ? (
        <Loader message="Loading kitchen queue..." />
      ) : error ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-cancelled-text)", padding: "2rem" }}>
          {error}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
            alignItems: "stretch",
          }}
        >
          <KanbanColumn
            title="Waiting in Queue"
            count={waitingOrders.length}
            orders={waitingOrders}
            color="#0284c7"
            icon={<Clock size={16} color="#0284c7" />}
          />

          <KanbanColumn
            title="Cooking in Kitchen"
            count={preparingOrders.length}
            orders={preparingOrders}
            color="#b45309"
            icon={<Flame size={16} color="#b45309" />}
          />

          <KanbanColumn
            title="Ready for Pickup"
            count={readyOrders.length}
            orders={readyOrders}
            color="#059669"
            icon={<Bell size={16} color="#059669" />}
          />

          <KanbanColumn
            title="Recently Completed"
            count={completedOrders.length}
            orders={completedOrders}
            color="#475569"
            icon={<CheckCircle2 size={16} color="#475569" />}
          />
        </div>
      )}
    </div>
  );
};
