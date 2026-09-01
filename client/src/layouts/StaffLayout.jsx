import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  Flame,
  Package,
  BarChart3,
  Tv,
  LogOut,
  ShieldCheck,
  Utensils,
} from "lucide-react";

export const StaffLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="app-container">
      {/* Staff Header Nav */}
      <header className="header-nav" style={{ borderBottom: "2px solid #ea580c" }}>
        <div className="header-inner">
          {/* Staff Brand */}
          <Link to="/staff/kitchen" className="brand-logo">
            <ShieldCheck size={22} color="#ea580c" />
            <span>Staff Portal</span>
            <span
              className="brand-badge"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              KDS Live
            </span>
          </Link>

          {/* Staff Nav Links */}
          <nav className="nav-links">
            <Link
              to="/staff/kitchen"
              className={`nav-link ${location.pathname === "/staff/kitchen" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Flame size={16} /> Kitchen KDS
            </Link>

            <Link
              to="/staff/inventory"
              className={`nav-link ${location.pathname === "/staff/inventory" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Package size={16} /> Stock & Menu
            </Link>

            <Link
              to="/staff/dashboard"
              className={`nav-link ${location.pathname === "/staff/dashboard" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <BarChart3 size={16} /> Analytics
            </Link>

            <Link
              to="/display"
              target="_blank"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Tv size={16} /> TV Queue ↗
            </Link>

            <Link
              to="/menu"
              target="_blank"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Utensils size={15} /> Student View ↗
            </Link>
          </nav>

          {/* Admin User Info & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Staff ({user?.username || "Admin"})
            </span>
            <button
              onClick={() => dispatch(logout())}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Staff Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
