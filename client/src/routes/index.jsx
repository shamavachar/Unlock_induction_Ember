import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { StaffLayout } from "../layouts/StaffLayout";
import { DisplayLayout } from "../layouts/DisplayLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Student Pages
import { MenuPage } from "../features/menu/pages/MenuPage";
import { CartPage } from "../features/cart/pages/CartPage";
import { CheckoutPage } from "../features/orders/pages/CheckoutPage";
import { OrderTrackingPage } from "../features/orders/pages/OrderTrackingPage";
import { OrderHistoryPage } from "../features/orders/pages/OrderHistoryPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { AdminLoginPage } from "../features/auth/pages/AdminLoginPage";

// Staff / Admin Pages
import { KitchenKanbanPage } from "../features/kitchen/pages/KitchenKanbanPage";
import { InventoryPage } from "../features/admin/pages/InventoryPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";

// Public Kiosk Display Page
import { LiveDisplayBoardPage } from "../features/display/pages/LiveDisplayBoardPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // 1. Student Portal Routes
      {
        element: <StudentLayout />,
        children: [
          { index: true, element: <Navigate to="/menu" replace /> },
          { path: "menu", element: <MenuPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "track", element: <OrderTrackingPage /> },
          { path: "track/:tokenNumber", element: <OrderTrackingPage /> },
          {
            path: "orders/history",
            element: (
              <ProtectedRoute requiredRole="student">
                <OrderHistoryPage />
              </ProtectedRoute>
            ),
          },
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },

      // 2. Staff Auth Page (Standalone)
      {
        path: "admin/login",
        element: <AdminLoginPage />,
      },

      // 3. Staff & Kitchen Management Portal
      {
        path: "staff",
        element: (
          <ProtectedRoute requiredRole="admin">
            <StaffLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/staff/kitchen" replace /> },
          { path: "kitchen", element: <KitchenKanbanPage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
        ],
      },

      // 4. Public TV Queue Kiosk Display
      {
        path: "display",
        element: <DisplayLayout />,
        children: [
          { index: true, element: <LiveDisplayBoardPage /> },
        ],
      },

      // 5. Fallback route
      {
        path: "*",
        element: <Navigate to="/menu" replace />,
      },
    ],
  },
]);
