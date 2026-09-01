import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuService } from "../../services/menuService";

export const fetchMenuItemsThunk = createAsyncThunk(
  "menu/fetchItems",
  async (params, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuItems(params);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  "menu/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await menuService.getCategories();
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleItemAvailabilityThunk = createAsyncThunk(
  "menu/toggleAvailability",
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.toggleAvailability(id);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemStockThunk = createAsyncThunk(
  "menu/updateStock",
  async ({ id, stockQuantity, action }, { rejectWithValue }) => {
    try {
      const response = await menuService.updateStock(id, { stockQuantity, action });
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMenuItemThunk = createAsyncThunk(
  "menu/createItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await menuService.createMenuItem(itemData);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMenuItemThunk = createAsyncThunk(
  "menu/updateItem",
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await menuService.updateMenuItem(id, itemData);
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMenuItemThunk = createAsyncThunk(
  "menu/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await menuService.deleteMenuItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  categories: ["All"],
  selectedCategory: "All",
  searchQuery: "",
  isVegOnly: false,
  availableOnly: false,
  chaosAlert: null,
  isLoading: false,
  error: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setIsVegOnly: (state, action) => {
      state.isVegOnly = action.payload;
    },
    setAvailableOnly: (state, action) => {
      state.availableOnly = action.payload;
    },
    setChaosAlert: (state, action) => {
      state.chaosAlert = action.payload;
    },
    clearChaosAlert: (state) => {
      state.chaosAlert = null;
    },
    updateItemStockLive: (state, action) => {
      const updated = action.payload;
      if (!updated || !updated._id) return;
      const index = state.items.findIndex((item) => item._id === updated._id);
      if (index !== -1) {
        state.items[index].stockQuantity = updated.stockQuantity;
        state.items[index].isAvailable = updated.isAvailable;
      }
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(fetchMenuItemsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMenuItemsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder.addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
      state.categories = Array.isArray(action.payload) ? action.payload : ["All"];
    });

    builder.addCase(toggleItemAvailabilityThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        const index = state.items.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      }
    });

    builder.addCase(updateItemStockThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        const index = state.items.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      }
    });

    builder.addCase(createMenuItemThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        state.items.unshift(action.payload);
      }
    });

    builder.addCase(updateMenuItemThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload._id) {
        const index = state.items.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      }
    });

    builder.addCase(deleteMenuItemThunk.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    });
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setIsVegOnly,
  setAvailableOnly,
  setChaosAlert,
  clearChaosAlert,
  updateItemStockLive,
} = menuSlice.actions;

export default menuSlice.reducer;
