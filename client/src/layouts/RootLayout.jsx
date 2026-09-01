import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { socketService } from "../services/socketService";
import { SOCKET_EVENTS } from "../constants";
import {
  handleOrderCreated,
  handleOrderStatusUpdated,
} from "../store/slices/orderSlice";
import {
  updateItemStockLive,
  setChaosAlert,
} from "../store/slices/menuSlice";
import { fetchLiveQueueThunk } from "../store/slices/queueSlice";

export const RootLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Connect Socket.IO
    socketService.connect();

    // 1. Listen for new order placed
    socketService.on(SOCKET_EVENTS.ORDER_CREATED, (order) => {
      dispatch(handleOrderCreated(order));
    });

    // 2. Listen for order status updates
    socketService.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (order) => {
      dispatch(handleOrderStatusUpdated(order));
    });

    socketService.on(SOCKET_EVENTS.ORDER_MY_STATUS_CHANGED, (order) => {
      dispatch(handleOrderStatusUpdated(order));
    });

    // 3. Listen for live stock updates
    socketService.on(SOCKET_EVENTS.MENU_STOCK_UPDATED, (menuItemData) => {
      dispatch(updateItemStockLive(menuItemData));
    });

    // 4. Listen for TV Queue updates
    socketService.on(SOCKET_EVENTS.QUEUE_UPDATED, () => {
      dispatch(fetchLiveQueueThunk());
    });

    // 5. Listen for Chaos / Rush hour alert
    socketService.on(SOCKET_EVENTS.CANTEEN_CHAOS_ALERT, (data) => {
      dispatch(setChaosAlert(data));
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  return <Outlet />;
};
