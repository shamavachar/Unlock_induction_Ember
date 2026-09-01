import React from "react";
import { StudentLoginForm } from "../components/StudentLoginForm";
import { Utensils } from "lucide-react";

export const LoginPage = () => {
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
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.75rem",
            }}
          >
            <Utensils size={24} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Student Sign In</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Order ahead & skip the canteen rush
          </p>
        </div>

        <StudentLoginForm />
      </div>
    </div>
  );
};
