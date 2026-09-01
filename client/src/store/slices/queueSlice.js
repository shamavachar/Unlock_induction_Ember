import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { queueService } from "../../services/queueService";

export const fetchLiveQueueThunk = createAsyncThunk(
  "queue/fetchLiveQueue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getLiveQueue();
      return response.data !== undefined ? response.data : response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ready: [],
  preparing: [],
  waiting: [],
  summary: {
    totalActive: 0,
    readyCount: 0,
    preparingCount: 0,
    waitingCount: 0,
    averageWaitMinutes: 0,
  },
  lastUpdated: null,
  isLoading: false,
  error: null,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setLiveQueueData: (state, action) => {
      const payload = action.payload || {};
      state.ready = payload.ready || [];
      state.preparing = payload.preparing || [];
      state.waiting = payload.waiting || [];
      state.summary = payload.summary || state.summary;
      state.lastUpdated = payload.lastUpdated || new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveQueueThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLiveQueueThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload || {};
        state.ready = payload.ready || [];
        state.preparing = payload.preparing || [];
        state.waiting = payload.waiting || [];
        state.summary = payload.summary || state.summary;
        state.lastUpdated = payload.lastUpdated || new Date().toISOString();
      })
      .addCase(fetchLiveQueueThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setLiveQueueData } = queueSlice.actions;
export default queueSlice.reducer;
