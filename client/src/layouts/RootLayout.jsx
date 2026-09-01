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

    socketService.connect();

    socketService.on(SOCKET_EVENTS.ORDER_CREATED, (order) => {
      dispatch(handleOrderCreated(order));
    });

    socketService.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (order) => {
      dispatch(handleOrderStatusUpdated(order));
    });

    socketService.on(SOCKET_EVENTS.ORDER_MY_STATUS_CHANGED, (order) => {
      dispatch(handleOrderStatusUpdated(order));
    });

    socketService.on(SOCKET_EVENTS.MENU_STOCK_UPDATED, (menuItemData) => {
      dispatch(updateItemStockLive(menuItemData));
    });

    socketService.on(SOCKET_EVENTS.QUEUE_UPDATED, () => {
      dispatch(fetchLiveQueueThunk());
    });

    socketService.on(SOCKET_EVENTS.CANTEEN_CHAOS_ALERT, (data) => {
      dispatch(setChaosAlert(data));
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  return <Outlet />;
};
