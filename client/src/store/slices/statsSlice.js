import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statsService } from "../../services/statsService";

export const fetchDashboardStatsThunk = createAsyncThunk(
  "stats/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await statsService.getDashboardStats();
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  today: {
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    statusBreakdown: {},
    topSellingItems: [],
  },
  inventory: {
    totalItems: 0,
    outOfStock: 0,
    lowStockItems: [],
  },
  isLoading: false,
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload || {};
        state.today = payload.today || state.today;
        state.inventory = payload.inventory || state.inventory;
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default statsSlice.reducer;
