import axiosInstance from "../api/axiosInstance";

export const checkoutService = {
  checkoutOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post("/orders/checkout", orderData);
      return response.data;
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error;
    }
  },
};
