import axiosInstance from "../api/axiosInstance.js";

export const authService = {
  login: async (payload) => {
    try {
      const response = await axiosInstance.post("/auth/login", payload);
      return response.data;
    } catch (error) {
      console.error("LOGIN ERROR SERVICE:", error.response);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/users/profile");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Get current user failed", error.response?.data);
      return null;
    }
  },

  registUser: async (payload) => {
    try {
      const response = await axiosInstance.post("/auth/register", payload);

      if (response.data === null || response.data === undefined) {
        console.log("⚠️ Response data is null, creating success response");
        return {
          success: true,
          message: "Registration successful",
          userId: payload.email,
          status: "CREATED",
        };
      }

      return {
        success: true,
        ...response.data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error("❌ Registration failed:", error);

      if (error.response?.status === 201 || error.response?.status === 200) {
        console.log(
          "⚠️ Status " +
            error.response.status +
            " but with error, maybe data saved"
        );
        return {
          success: true,
          message: "Registration completed (data saved)",
          status: "SAVED_WITH_WARNING",
        };
      }

      throw error;
    }
  },
};
