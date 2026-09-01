import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "../../services/orderService";

export const placeOrderThunk = createAsyncThunk(
  "orders/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const trackOrderThunk = createAsyncThunk(
  "orders/trackOrder",
  async (tokenOrId, { rejectWithValue }) => {
    try {
      const response = await orderService.trackOrder(tokenOrId);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStaffOrdersThunk = createAsyncThunk(
  "orders/fetchStaffOrders",
  async (params = { status: "active" }, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(id, status, note);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  "orders/cancelOrder",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(id, reason);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  activeTrackedOrder: null,
  staffOrders: [],
  orderHistory: [],
  isPlacingOrder: false,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearActiveTrackedOrder: (state) => {
      state.activeTrackedOrder = null;
    },
    handleOrderCreated: (state, action) => {
      const newOrder = action.payload;
      if (newOrder && newOrder._id && !state.staffOrders.some((o) => o._id === newOrder._id)) {
        state.staffOrders.unshift(newOrder);
      }
    },
    handleOrderStatusUpdated: (state, action) => {
      const updated = action.payload;
      if (!updated) return;

      if (
        state.activeTrackedOrder &&
        (state.activeTrackedOrder._id === updated._id ||
          state.activeTrackedOrder.tokenNumber === updated.tokenNumber)
      ) {
        state.activeTrackedOrder = {
          ...state.activeTrackedOrder,
          ...updated,
        };
      }

      const staffIdx = state.staffOrders.findIndex((o) => o._id === updated._id);
      if (staffIdx !== -1) {
        state.staffOrders[staffIdx] = {
          ...state.staffOrders[staffIdx],
          ...updated,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Place Order
    builder
      .addCase(placeOrderThunk.pending, (state) => {
        state.isPlacingOrder = true;
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        state.isPlacingOrder = false;
        state.activeTrackedOrder = action.payload;
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.isPlacingOrder = false;
        state.error = action.payload;
      });

    // Track Order
    builder
      .addCase(trackOrderThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrderThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTrackedOrder = action.payload;
      })
      .addCase(trackOrderThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Staff Orders
    builder
      .addCase(fetchStaffOrdersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffOrdersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStaffOrdersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Status
    builder.addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        const index = state.staffOrders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.staffOrders[index] = action.payload;
        }
      }
    });

    // Cancel Order
    builder.addCase(cancelOrderThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        const index = state.staffOrders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.staffOrders[index] = action.payload;
        }
      }
    });
  },
});

export const {
  clearActiveTrackedOrder,
  handleOrderCreated,
  handleOrderStatusUpdated,
} = orderSlice.actions;

export default orderSlice.reducer;
