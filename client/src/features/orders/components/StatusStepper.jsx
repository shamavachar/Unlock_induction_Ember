import React from "react";
import { Check, Clock, Flame, Bell, CheckCircle } from "lucide-react";

export const StatusStepper = ({ status, statusHistory = [] }) => {
  const steps = [
    { id: "Waiting", label: "Waiting in Queue", icon: Clock },
    { id: "Preparing", label: "Cooking in Kitchen", icon: Flame },
    { id: "Ready", label: "Ready for Pickup", icon: Bell },
    { id: "Completed", label: "Collected", icon: CheckCircle },
  ];

  const statusOrder = ["Waiting", "Preparing", "Ready", "Completed"];
  const isCancelled = status === "Cancelled";
  const currentIndex = statusOrder.indexOf(status);

  if (isCancelled) {
    return (
      <div
        style={{
          background: "var(--color-cancelled-bg)",
          color: "var(--color-cancelled-text)",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        ⚠️ This order was cancelled.
      </div>
    );
  }

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {steps.map((step, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
                flex: 1,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "#10b981"
                    : isCurrent
                    ? "var(--color-primary)"
                    : "var(--color-bg-subtle)",
                  color: isDone || isCurrent ? "#ffffff" : "var(--color-text-subtle)",
                  border: isCurrent ? "3px solid #ffedd5" : "1px solid var(--color-border)",
                  transition: "all 0.2s ease",
                  boxShadow: isCurrent ? "var(--shadow-md)" : "none",
                }}
              >
                {isDone ? <Check size={18} /> : <StepIcon size={18} />}
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "0.5rem",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? "var(--color-primary)"
                    : isDone
                    ? "var(--color-text-main)"
                    : "var(--color-text-subtle)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            top: "19px",
            left: "12%",
            right: "12%",
            height: "2px",
            background: "var(--color-border)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#10b981",
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};
