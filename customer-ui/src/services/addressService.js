import axiosInstance from "../api/axiosInstance";

export const addressService = {
  getAllAddresses: async () => {
    try {
      const response = await axiosInstance.get("/addresses");
      return response.data;
    } catch (error) {
      console.error("❌ GET /addresses error:", error);
      throw error;
    }
  },

  createAddress: async (data) => {
    try {
      const response = await axiosInstance.post(`/addresses`, data);
      return response.data;
    } catch (error) {
      console.error("error post address", error);
    }
  },

  updateAddress: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/addresses/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("error update alamat", error);
    }
  },

  deleteAddress: async (id) => {
    try {
      const response = await axiosInstance.delete(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error("error delete address", error);
      throw error;
    }
  },

  setPrimaryAddress: async (id) => {
    try {
      const response = await axiosInstance.patch(`/addresses/${id}/primary`);
      return response.data;
    } catch (error) {
      console.error("error set primary address", error);
      throw error;
    }
  },
};
