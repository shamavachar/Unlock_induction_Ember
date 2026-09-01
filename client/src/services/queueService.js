import axiosClient from "../api/axiosClient";

export const queueService = {

  getLiveQueue: async () => {
    return await axiosClient.get("/queue/live");
  },
};
