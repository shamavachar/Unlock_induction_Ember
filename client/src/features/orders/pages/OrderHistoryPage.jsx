import React, { useEffect, useState } from "react";
import { orderService } from "../../../services/orderService";
import { StatusBadge } from "../../../components/common/Badge";
import { Loader } from "../../../components/common/Loader";
import { Link } from "react-router-dom";
import { History, ArrowRight, Clock } from "lucide-react";

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Student view orders
        const res = await orderService.getOrders({ limit: 20 });
        setOrders(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <History size={24} color="var(--color-primary)" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Order History</h1>
      </div>

      {isLoading ? (
        <Loader message="Loading order history..." />
      ) : error ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-cancelled-text)", padding: "2rem" }}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--color-text-muted)" }}>
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>No past orders found</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Your completed and active canteen orders will show here.</p>
          <Link to="/menu" className="btn btn-primary btn-sm" style={{ marginTop: "1rem", display: "inline-flex" }}>
            Explore Menu
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <span className="token-box" style={{ fontSize: "1.1rem", padding: "0.25rem 0.6rem" }}>
                    {order.tokenNumber}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {order.items?.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "0.75rem",
                        background: "var(--color-bg-subtle)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                  ₹{order.totalAmount}
                </span>
                <Link
                  to={`/track/${order.tokenNumber}`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  Track Token <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
