// src/services/userService.js
import axiosInstance from "../api/axiosInstance";

export const userService = {
  // Validasi PIN user
  validatePin: async (pin) => {
    try {
      const response = await axiosInstance.post("/users/validate-pin", { pin });
      return response.data;
    } catch (error) {
      console.error("Error validating PIN:", error);
      throw error;
    }
  },

  // Update PIN user
  updatePin: async (oldPin, newPin) => {
    try {
      const response = await axiosInstance.put("/users/pin", {
        oldPin,
        newPin,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating PIN:", error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/users/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Reset PIN (forgot PIN)
  resetPin: async (email) => {
    try {
      const response = await api.post("/users/reset-pin", { email });
      return response.data;
    } catch (error) {
      console.error("Error resetting PIN:", error);
      throw error;
    }
  },
};
