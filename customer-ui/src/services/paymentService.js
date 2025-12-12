// services/paymentService.js
import axiosInstance from "../api/axiosInstance"; // pastikan ini sudah ada

export const paymentService = {
  async processPayment(orderId, paymentData) {
    try {
      console.log(`🔐 Calling payment endpoint: /payments/pay/${orderId}`);
      console.log("📤 Sending data:", {
        ...paymentData,
        pin: "***", // Jangan log PIN asli
      });

      // PERBAIKAN: Gunakan endpoint yang benar
      const response = await axiosInstance.post(
        `/payments/pay/${orderId}`,
        paymentData
      );

      console.log("✅ Payment API response:", response);

      // Kembalikan dalam format yang konsisten
      if (response.data) {
        return {
          success: true,
          status: "SUCCESS",
          data: response.data,
          statusCode: response.status,
          message: response.data.message || "Payment successful",
        };
      }

      // Fallback jika response.data tidak ada
      return {
        success: true,
        status: "SUCCESS",
        data: { orderId, ...paymentData, status: "PAID" },
        statusCode: response.status || 200,
        message: "Payment processed successfully",
      };
    } catch (error) {
      console.error("❌ Payment service error:", error);

      // Format error response yang konsisten
      if (error.response) {
        const errorData = {
          success: false,
          status: "ERROR",
          statusCode: error.response.status,
          data: error.response.data,
          message:
            error.response.data?.message ||
            error.response.data?.error ||
            `Payment failed with status ${error.response.status}`,
        };
        console.log("⚠️ Error response:", errorData);
        return errorData; // Return error object, bukan throw
      }

      // Error network atau lainnya
      return {
        success: false,
        status: "NETWORK_ERROR",
        message: error.message || "Network error occurred",
      };
    }
  },
};
