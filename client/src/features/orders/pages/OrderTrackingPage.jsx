import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { trackOrderThunk } from "../../../store/slices/orderSlice";
import { socketService } from "../../../services/socketService";
import { LiveTrackerCard } from "../components/LiveTrackerCard";
import { Loader } from "../../../components/common/Loader";
import { Search, ArrowLeft, RefreshCw, Tv, Utensils } from "lucide-react";

export const OrderTrackingPage = () => {
  const { tokenNumber } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchToken, setSearchToken] = useState(tokenNumber || "");
  const { activeTrackedOrder, isLoading, error } = useSelector((state) => state.orders);

  // Fetch and connect to socket room whenever token changes
  useEffect(() => {
    if (tokenNumber) {
      dispatch(trackOrderThunk(tokenNumber));
      socketService.joinRoom(`token_${tokenNumber}`);

      return () => {
        socketService.leaveRoom(`token_${tokenNumber}`);
      };
    }
  }, [tokenNumber, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchToken.trim()) {
      navigate(`/track/${searchToken.trim().toUpperCase()}`);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Bar Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <Link
          to="/menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
          }}
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>

        <Link
          to="/display"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          <Tv size={16} /> Canteen TV Board ↗
        </Link>
      </div>

      {/* Search Bar for Other Tokens */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Track another token (e.g. CR-101)..."
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 600 }}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Track
        </button>
      </form>

      {/* Tracking Card Content */}
      {isLoading && !activeTrackedOrder ? (
        <Loader message="Tracking your token..." />
      ) : error ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "var(--color-cancelled-bg)",
            color: "var(--color-cancelled-text)",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Token Not Found</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.35rem" }}>
            {error || "We couldn't find an order with this token number. Check the code and try again."}
          </p>
          <Link to="/menu" className="btn btn-secondary btn-sm" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
            <Utensils size={14} /> Back to Food Menu
          </Link>
        </div>
      ) : activeTrackedOrder ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              ⚡ Live updates active (Socket.IO connected)
            </span>
            <button
              onClick={() => dispatch(trackOrderThunk(tokenNumber))}
              className="btn btn-secondary btn-sm"
              title="Refresh status"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <LiveTrackerCard order={activeTrackedOrder} />
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Enter your token number above to track your food.</p>
        </div>
      )}
    </div>
  );
};
