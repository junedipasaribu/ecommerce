import axiosInstance from "../api/axiosInstance";

export const cartService = {
  // ============ GET ALL CART ITEMS ============
  getAllCart: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      return res.data?.items || res.data || [];
    } catch (error) {
      console.error("❌ Error getAllCart:", error);
      return [];
    }
  },

  // ============ GET CART COUNT ============
  getCartCount: async () => {
    try {
      const res = await axiosInstance.get("/cart/count");
      const data = res.data;

      if (typeof data === "number") return data;
      if (data?.count) return data.count;
      if (data?.total) return data.total;

      const parsed = parseInt(data);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error("❌ Error getCartCount:", error);
      return 0;
    }
  },

  // ============ ADD TO CART ============
  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await axiosInstance.post("/cart/add", {
        productId,
        quantity,
      });
      return res.data;
    } catch (error) {
      console.error("❌ Error addToCart:", error);
      throw error;
    }
  },

  // ============ UPDATE CART ITEM ============
  updateCart: async (productId, quantity = 1) => {
    try {
      const res = await axiosInstance.put("/cart/update", {
        productId,
        quantity,
      });
      return res.data;
    } catch (error) {
      console.error("❌ Error updateCart:", error);
      throw error;
    }
  },

  // ============ REMOVE CART ITEM ============
  removeFromCart: async (productId) => {
    try {
      console.log(`📤 DELETE /api/cart/remove/${productId}`);
      const response = await axiosInstance.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error removeFromCart:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log("📤 DELETE /api/cart/clear");
      const response = await axiosInstance.delete("/cart/clear");
      return response.data;
    } catch (error) {
      console.error("❌ Error clearCart:", error);
      throw error;
    }
  },
};
