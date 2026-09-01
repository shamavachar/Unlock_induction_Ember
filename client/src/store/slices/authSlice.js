import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

// Helper to get initial state from localStorage safely
const getInitialStoredState = () => {
  try {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token") || null;
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      user,
      token,
      isAuthenticated: Boolean(token),
      role: user?.role || (token ? "student" : null),
    };
  } catch {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
    };
  }
};

const initialStored = getInitialStoredState();

export const registerStudentThunk = createAsyncThunk(
  "auth/registerStudent",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.registerStudent(userData);
      // Backend returns { success: true, token, user, message }
      return response.token ? response : (response.data || response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginStudentThunk = createAsyncThunk(
  "auth/loginStudent",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginStudent(credentials);
      // Backend returns { success: true, token, user, message }
      return response.token ? response : (response.data || response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginAdminThunk = createAsyncThunk(
  "auth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginAdmin(credentials);
      // Backend returns { success: true, token, admin, message }
      return response.token ? response : (response.data || response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: initialStored.user,
  token: initialStored.token,
  isAuthenticated: initialStored.isAuthenticated,
  role: initialStored.role,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerStudentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStudentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user || null;
          state.role = "student";
          localStorage.setItem("token", action.payload.token);
          if (action.payload.user) {
            localStorage.setItem("user", JSON.stringify(action.payload.user));
          }
        }
      })
      .addCase(registerStudentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed. Please check your details.";
      });

    // Student Login
    builder
      .addCase(loginStudentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginStudentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user || null;
          state.role = "student";
          localStorage.setItem("token", action.payload.token);
          if (action.payload.user) {
            localStorage.setItem("user", JSON.stringify(action.payload.user));
          }
        }
      })
      .addCase(loginStudentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed. Please check your credentials.";
      });

    // Admin Login
    builder
      .addCase(loginAdminThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.admin || null;
          state.role = "admin";
          localStorage.setItem("token", action.payload.token);
          if (action.payload.admin) {
            localStorage.setItem("user", JSON.stringify(action.payload.admin));
          }
        }
      })
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Admin login failed.";
      });

    // Get Me
    builder
      .addCase(getMeThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.role = action.payload.role || state.role;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
