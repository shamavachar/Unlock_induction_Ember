import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLiveQueueThunk } from "../../../store/slices/queueSlice";
import { socketService } from "../../../services/socketService";
import { Bell, Flame, Clock, Radio, Utensils } from "lucide-react";

export const LiveDisplayBoardPage = () => {
  const dispatch = useDispatch();
  const { ready, preparing, waiting, summary, lastUpdated } = useSelector((state) => state.queue);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchLiveQueueThunk());
    socketService.joinRoom("display_board");

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      socketService.leaveRoom("display_board");
    };
  }, [dispatch]);

  return (
    <div className="tv-display-container">

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid #1e293b",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#ea580c",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Utensils size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              CAMPUS SMART CANTEEN
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Live Order Queue & Pickup Display Board
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Average Wait Time</span>
            <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f59e0b" }}>
              ~{summary.averageWaitMinutes || 8} mins
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Active Orders</span>
            <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#38bdf8" }}>
              {summary.totalActive || 0}
            </p>
          </div>

          <div
            style={{
              background: "#1e293b",
              padding: "0.5rem 1.25rem",
              borderRadius: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            {time.toLocaleTimeString()}
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", flex: 1 }}>

        <div
          style={{
            background: "#064e3b",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "2px solid #059669",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid #047857",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Bell size={26} color="#34d399" />
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#a7f3d0" }}>
                NOW SERVING • READY FOR PICKUP
              </h2>
            </div>
            <span
              style={{
                background: "#047857",
                color: "#ecfdf5",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "4px 12px",
                borderRadius: "999px",
              }}
            >
              {ready.length} Ready
            </span>
          </div>

          {ready.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6ee7b7",
                fontSize: "1.2rem",
                fontWeight: 500,
              }}
            >
              All prepared orders have been collected!
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
                overflowY: "auto",
              }}
            >
              {ready.map((order) => (
                <div
                  key={order._id}
                  style={{
                    background: "#022c22",
                    border: "2px solid #34d399",
                    borderRadius: "12px",
                    padding: "1rem",
                    textAlign: "center",
                    boxShadow: "0 0 15px rgba(52, 211, 153, 0.2)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: "#6ee7b7",
                      display: "block",
                    }}
                  >
                    {order.tokenNumber}
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "#a7f3d0", fontWeight: 600 }}>
                    {order.studentName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div
            style={{
              background: "#451a03",
              borderRadius: "16px",
              padding: "1.25rem",
              border: "1px solid #b45309",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Flame size={22} color="#fbbf24" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fef3c7" }}>
                  PREPARING IN KITCHEN
                </h3>
              </div>
              <span style={{ background: "#78350f", color: "#fef3c7", padding: "2px 10px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 700 }}>
                {preparing.length}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", overflowY: "auto" }}>
              {preparing.length === 0 ? (
                <p style={{ color: "#fde68a", fontSize: "0.9rem" }}>No orders currently on stove.</p>
              ) : (
                preparing.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      background: "#291305",
                      border: "1px solid #f59e0b",
                      borderRadius: "8px",
                      padding: "0.5rem 0.85rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#fbbf24",
                    }}
                  >
                    {order.tokenNumber}
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              background: "#0c2340",
              borderRadius: "16px",
              padding: "1.25rem",
              border: "1px solid #0369a1",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={20} color="#7dd3fc" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e0f2fe" }}>
                  IN QUEUE / UP NEXT
                </h3>
              </div>
              <span style={{ background: "#075985", color: "#e0f2fe", padding: "2px 10px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 700 }}>
                {waiting.length}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", overflowY: "auto" }}>
              {waiting.length === 0 ? (
                <p style={{ color: "#bae6fd", fontSize: "0.85rem" }}>Queue is clear.</p>
              ) : (
                waiting.map((order) => (
                  <span
                    key={order._id}
                    style={{
                      background: "#082f49",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#7dd3fc",
                    }}
                  >
                    {order.tokenNumber}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <footer
        style={{
          marginTop: "1.25rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#94a3b8",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Radio size={14} color="#10b981" />
          <span>Live Canteen Network • Connected</span>
        </div>
        <marquee style={{ maxWidth: "700px" }}>
          📢 Please keep your phone token screen ready • Thank you for dining with Campus Canteen!
        </marquee>
      </footer>
    </div>
  );
};
