import axiosClient from "../api/axiosClient";

export const statsService = {

  getDashboardStats: async () => {
    return await axiosClient.get("/stats/dashboard");
  },
};
