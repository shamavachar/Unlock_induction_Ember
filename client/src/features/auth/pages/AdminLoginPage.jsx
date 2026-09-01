import React from "react";
import { AdminLoginForm } from "../components/AdminLoginForm";
import { ShieldCheck } from "lucide-react";

export const AdminLoginPage = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
        padding: "1rem",
      }}
    >
      <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#e0f2fe",
              color: "#0284c7",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.75rem",
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Staff & Kitchen Portal</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Sign in to manage orders, live stock, and rush hours
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
};
