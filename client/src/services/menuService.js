import axiosClient from "../api/axiosClient";

export const menuService = {

  getMenuItems: async (params = {}) => {
    return await axiosClient.get("/menu", { params });
  },

  getCategories: async () => {
    return await axiosClient.get("/menu/categories");
  },

  getMenuItemById: async (id) => {
    return await axiosClient.get(`/menu/${id}`);
  },

  createMenuItem: async (itemData) => {
    return await axiosClient.post("/menu", itemData);
  },

  updateMenuItem: async (id, itemData) => {
    return await axiosClient.put(`/menu/${id}`, itemData);
  },

  toggleAvailability: async (id) => {
    return await axiosClient.patch(`/menu/${id}/toggle`);
  },

  updateStock: async (id, { stockQuantity, action }) => {
    return await axiosClient.patch(`/menu/${id}/stock`, { stockQuantity, action });
  },

  deleteMenuItem: async (id) => {
    return await axiosClient.delete(`/menu/${id}`);
  },

  triggerChaosMode: async (data = {}) => {
    return await axiosClient.post("/menu/chaos-mode", data);
  },
};
