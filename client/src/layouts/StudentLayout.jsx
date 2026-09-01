import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toggleCartDrawer } from "../store/slices/cartSlice";
import { ChaosBanner } from "../components/common/ChaosBanner";
import { CartDrawer } from "../features/cart/components/CartDrawer";
import {
  Utensils,
  ShoppingBag,
  History,
  Tv,
  LogIn,
  LogOut,
  User,
  Search,
} from "lucide-react";

export const StudentLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  return (
    <div className="app-container">

      <ChaosBanner />

      <header className="header-nav">
        <div className="header-inner">

          <Link to="/menu" className="brand-logo">
            <Utensils size={22} />
            <span>CanteenRush</span>
            <span className="brand-badge">Smart Campus</span>
          </Link>

          <nav className="nav-links">
            <Link
              to="/menu"
              className={`nav-link ${location.pathname === "/menu" ? "active" : ""}`}
            >
              Food Menu
            </Link>

            <Link
              to="/track"
              className={`nav-link ${location.pathname.startsWith("/track") ? "active" : ""}`}
            >
              Track Token
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders/history"
                className={`nav-link ${location.pathname === "/orders/history" ? "active" : ""}`}
              >
                Order History
              </Link>
            )}

            <Link
              to="/display"
              target="_blank"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
              title="Open Public Canteen TV Board"
            >
              <Tv size={15} /> TV Board ↗
            </Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>

            <button
              onClick={() => dispatch(toggleCartDrawer(true))}
              className="btn btn-secondary btn-sm"
              style={{ position: "relative", padding: "0.45rem 0.85rem" }}
            >
              <ShoppingBag size={18} color="var(--color-primary)" />
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-main)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <User size={14} color="var(--color-primary)" />
                  {user?.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => dispatch(logout())}
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <CartDrawer />
    </div>
  );
};
