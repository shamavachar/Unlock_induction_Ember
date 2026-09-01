import axiosClient from "../api/axiosClient";

export const menuService = {
  // Fetch all menu items with query filters (category, isVeg, availableOnly, search)
  getMenuItems: async (params = {}) => {
    return await axiosClient.get("/menu", { params });
  },

  // Fetch unique categories list
  getCategories: async () => {
    return await axiosClient.get("/menu/categories");
  },

  // Fetch single item by ID
  getMenuItemById: async (id) => {
    return await axiosClient.get(`/menu/${id}`);
  },

  // Admin: Create new menu item
  createMenuItem: async (itemData) => {
    return await axiosClient.post("/menu", itemData);
  },

  // Admin: Update menu item
  updateMenuItem: async (id, itemData) => {
    return await axiosClient.put(`/menu/${id}`, itemData);
  },

  // Admin: Toggle availability switch
  toggleAvailability: async (id) => {
    return await axiosClient.patch(`/menu/${id}/toggle`);
  },

  // Admin: Quick stock increment / set
  updateStock: async (id, { stockQuantity, action }) => {
    return await axiosClient.patch(`/menu/${id}/stock`, { stockQuantity, action });
  },

  // Admin: Delete item
  deleteMenuItem: async (id) => {
    return await axiosClient.delete(`/menu/${id}`);
  },

  // Admin: Trigger Chaos / Rush mode
  triggerChaosMode: async (data = {}) => {
    return await axiosClient.post("/menu/chaos-mode", data);
  },
};
