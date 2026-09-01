import axiosClient from "../api/axiosClient";

export const statsService = {
  // Admin: Analytics & Kitchen metrics dashboard
  getDashboardStats: async () => {
    return await axiosClient.get("/stats/dashboard");
  },
};
