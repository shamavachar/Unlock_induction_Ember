import axiosClient from "../api/axiosClient";

export const authService = {

  registerStudent: async (userData) => {
    return await axiosClient.post("/auth/register", userData);
  },

  loginStudent: async (credentials) => {
    return await axiosClient.post("/auth/login", credentials);
  },

  loginAdmin: async (credentials) => {
    return await axiosClient.post("/auth/admin/login", credentials);
  },

  getMe: async () => {
    return await axiosClient.get("/auth/me");
  },
};
