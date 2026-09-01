import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearChaosAlert } from "../../store/slices/menuSlice";

export const ChaosBanner = () => {
  const dispatch = useDispatch();
  const chaosAlert = useSelector((state) => state.menu.chaosAlert);

  if (!chaosAlert) return null;

  return (
    <div className="chaos-alert-banner">
      <AlertTriangle size={18} />
      <span>{chaosAlert.message || "CANTEEN RUSH HOUR ACTIVE! Limited items available."}</span>
      <button
        onClick={() => dispatch(clearChaosAlert())}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
