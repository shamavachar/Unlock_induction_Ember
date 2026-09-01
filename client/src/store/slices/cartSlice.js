import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem("canteen_cart");
    return saved ? JSON.parse(saved) : { items: [], notes: "" };
  } catch {
    return { items: [], notes: "" };
  }
};

const initialCart = loadCartFromStorage();

const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedPrepTime = items.length > 0 
    ? Math.max(...items.map((i) => i.preparationTimeMinutes || 5)) + (totalItems > 3 ? 5 : 0)
    : 0;

  return { totalItems, totalAmount, estimatedPrepTime };
};

const totals = calculateTotals(initialCart.items);

const initialState = {
  items: initialCart.items,
  notes: initialCart.notes || "",
  totalItems: totals.totalItems,
  totalAmount: totals.totalAmount,
  estimatedPrepTime: totals.estimatedPrepTime,
  isDrawerOpen: false,
};

const saveToStorage = (state) => {
  localStorage.setItem(
    "canteen_cart",
    JSON.stringify({ items: state.items, notes: state.notes })
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.menuItemId === item._id || i.menuItemId === item.menuItemId);

      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({
          menuItemId: item._id || item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
          isVeg: item.isVeg,
          preparationTimeMinutes: item.preparationTimeMinutes || 5,
        });
      }

      const t = calculateTotals(state.items);
      state.totalItems = t.totalItems;
      state.totalAmount = t.totalAmount;
      state.estimatedPrepTime = t.estimatedPrepTime;
      saveToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { menuItemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.menuItemId !== menuItemId);
      } else {
        const item = state.items.find((i) => i.menuItemId === menuItemId);
        if (item) {
          item.quantity = quantity;
        }
      }

      const t = calculateTotals(state.items);
      state.totalItems = t.totalItems;
      state.totalAmount = t.totalAmount;
      state.estimatedPrepTime = t.estimatedPrepTime;
      saveToStorage(state);
    },

    removeFromCart: (state, action) => {
      const menuItemId = action.payload;
      state.items = state.items.filter((i) => i.menuItemId !== menuItemId);
      const t = calculateTotals(state.items);
      state.totalItems = t.totalItems;
      state.totalAmount = t.totalAmount;
      state.estimatedPrepTime = t.estimatedPrepTime;
      saveToStorage(state);
    },

    setNotes: (state, action) => {
      state.notes = action.payload;
      saveToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.notes = "";
      state.totalItems = 0;
      state.totalAmount = 0;
      state.estimatedPrepTime = 0;
      saveToStorage(state);
    },

    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  setNotes,
  clearCart,
  toggleCartDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
