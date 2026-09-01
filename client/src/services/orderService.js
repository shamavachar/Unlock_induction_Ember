import axiosClient from "../api/axiosClient";

export const orderService = {
  // Student / Guest: Place a new order
  createOrder: async (orderData) => {
    return await axiosClient.post("/orders", orderData);
  },

  // Student / Staff: Track order by Token Number (e.g. CR-101) or MongoDB _id
  trackOrder: async (tokenOrId) => {
    return await axiosClient.get(`/orders/track/${tokenOrId}`);
  },

  // Staff / Admin: Get all orders with status/search filters and pagination
  getOrders: async (params = {}) => {
    return await axiosClient.get("/orders", { params });
  },

  // Get order by MongoDB ID
  getOrderById: async (id) => {
    return await axiosClient.get(`/orders/${id}`);
  },

  // Staff: Advance order status (Waiting -> Preparing -> Ready -> Completed)
  updateOrderStatus: async (id, status, note = "") => {
    return await axiosClient.patch(`/orders/${id}/status`, { status, note });
  },

  // Staff / Student: Cancel order
  cancelOrder: async (id, reason = "") => {
    return await axiosClient.patch(`/orders/${id}/cancel`, { reason });
  },
};
