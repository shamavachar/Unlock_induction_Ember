import axiosClient from "../api/axiosClient";

export const orderService = {

  createOrder: async (orderData) => {
    return await axiosClient.post("/orders", orderData);
  },

  trackOrder: async (tokenOrId) => {
    return await axiosClient.get(`/orders/track/${tokenOrId}`);
  },

  getOrders: async (params = {}) => {
    return await axiosClient.get("/orders", { params });
  },

  getOrderById: async (id) => {
    return await axiosClient.get(`/orders/${id}`);
  },

  updateOrderStatus: async (id, status, note = "") => {
    return await axiosClient.patch(`/orders/${id}/status`, { status, note });
  },

  cancelOrder: async (id, reason = "") => {
    return await axiosClient.patch(`/orders/${id}/cancel`, { reason });
  },
};
