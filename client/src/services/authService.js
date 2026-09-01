import axiosClient from "../api/axiosClient";

export const authService = {
  // Student Register
  registerStudent: async (userData) => {
    return await axiosClient.post("/auth/register", userData);
  },

  // Student Login
  loginStudent: async (credentials) => {
    return await axiosClient.post("/auth/login", credentials);
  },

  // Admin / Kitchen Staff Login
  loginAdmin: async (credentials) => {
    return await axiosClient.post("/auth/admin/login", credentials);
  },

  // Current Logged-in User Profile
  getMe: async () => {
    return await axiosClient.get("/auth/me");
  },
};
