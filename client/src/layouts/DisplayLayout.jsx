import React from "react";
import { Outlet } from "react-router-dom";

export const DisplayLayout = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#090d16" }}>
      <Outlet />
    </div>
  );
};
