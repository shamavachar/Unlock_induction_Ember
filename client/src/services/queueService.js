import axiosClient from "../api/axiosClient";

export const queueService = {
  // Public Display Board & TV Screen Live Queue
  getLiveQueue: async () => {
    return await axiosClient.get("/queue/live");
  },
};
