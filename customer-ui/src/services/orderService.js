import axiosInstance from "../api/axiosInstance";

export const orderService = {
  // ✅ BENAR: Gunakan endpoint /orders/my/{orderId}
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/my/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // ✅ BENAR: Untuk semua orders user
  getAllOrders: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/orders/my", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // ✅ BENAR: Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await axiosInstance.patch(`/orders/cancel/${orderId}`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  // ✅ BENAR: Get order items
  getOrderItems: async (orderId) => {
    try {
      const response = await api.get(`/orders/my/${orderId}/items`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order items:", error);
      throw error;
    }
  },
};
