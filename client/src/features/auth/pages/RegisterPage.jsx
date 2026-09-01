import React from "react";
import { RegisterForm } from "../components/RegisterForm";
import { UserPlus } from "lucide-react";

export const RegisterPage = () => {
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
      <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "2rem" }}>
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Student Registration</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Create your account to track orders in real-time
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
};
