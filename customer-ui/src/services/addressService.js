import axiosInstance from "../api/axiosInstance";

export const addressService = {
  // GET: Get all addresses
  getAllAddresses: async () => {
    try {
      console.log("📤 GET /addresses");
      const response = await axiosInstance.get("/addresses");
      console.log("✅ GET /addresses success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ GET /addresses error:", error);
      throw error;
    }
  },

  // POST: Create new address
  createAddress: async (addressData) => {
    try {
      console.log("📝 POST /addresses - Data:", addressData);

      // Try different endpoints
      const endpoints = [
        "/addresses",
        "/address",
        "/shipping-address",
        "/customer/address",
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying POST ${endpoint}`);
          const response = await axiosInstance.post(endpoint, addressData);
          console.log(`✅ POST ${endpoint} success:`, response.data);
          return response.data;
        } catch (err) {
          console.log(
            `❌ POST ${endpoint} failed:`,
            err.response?.data || err.message
          );
          // Continue to next endpoint
        }
      }

      throw new Error("No working create address endpoint found");
    } catch (error) {
      console.error("❌ createAddress error:", error);
      throw error;
    }
  },

  // PUT: Update address
  updateAddress: async (addressId, addressData) => {
    try {
      console.log(`✏️ PUT /addresses/${addressId} - Data:`, addressData);

      // Try different endpoints
      const endpoints = [
        `/addresses/${addressId}`,
        `/address/${addressId}`,
        `/shipping-address/${addressId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying PUT ${endpoint}`);
          const response = await axiosInstance.put(endpoint, addressData);
          console.log(`✅ PUT ${endpoint} success:`, response.data);
          return response.data;
        } catch (err) {
          console.log(
            `❌ PUT ${endpoint} failed:`,
            err.response?.data || err.message
          );
        }
      }

      throw new Error("No working update address endpoint found");
    } catch (error) {
      console.error("❌ updateAddress error:", error);
      throw error;
    }
  },

  // DELETE: Remove address
  deleteAddress: async (addressId) => {
    try {
      console.log(`🗑️ DELETE /addresses/${addressId}`);

      // Try different endpoints
      const endpoints = [
        `/addresses/${addressId}`,
        `/address/${addressId}`,
        `/shipping-address/${addressId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying DELETE ${endpoint}`);
          const response = await axiosInstance.delete(endpoint);
          console.log(`✅ DELETE ${endpoint} success:`, response.data);
          return response.data;
        } catch (err) {
          console.log(
            `❌ DELETE ${endpoint} failed:`,
            err.response?.data || err.message
          );
        }
      }

      throw new Error("No working delete address endpoint found");
    } catch (error) {
      console.error("❌ deleteAddress error:", error);
      throw error;
    }
  },

  // PATCH: Set as primary address
  setPrimaryAddress: async (addressId) => {
    try {
      console.log(`⭐ PATCH /addresses/${addressId}/primary`);

      // Try different endpoints
      const endpoints = [
        `/addresses/${addressId}/primary`,
        `/address/${addressId}/set-primary`,
        `/addresses/${addressId}`,
        `/address/${addressId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying PATCH ${endpoint}`);

          // For endpoints that don't have /primary, we send isPrimary in body
          if (
            endpoint.includes("/primary") ||
            endpoint.includes("set-primary")
          ) {
            const response = await axiosInstance.patch(endpoint);
            console.log(`✅ PATCH ${endpoint} success:`, response.data);
            return response.data;
          } else {
            // Update with isPrimary: true
            const response = await axiosInstance.patch(endpoint, {
              isPrimary: true,
            });
            console.log(`✅ PATCH ${endpoint} success:`, response.data);
            return response.data;
          }
        } catch (err) {
          console.log(
            `❌ PATCH ${endpoint} failed:`,
            err.response?.data || err.message
          );
        }
      }

      throw new Error("No working set primary address endpoint found");
    } catch (error) {
      console.error("❌ setPrimaryAddress error:", error);
      throw error;
    }
  },

  // GET: Get address by ID
  getAddressById: async (addressId) => {
    try {
      console.log(`🔍 GET /addresses/${addressId}`);
      const response = await axiosInstance.get(`/addresses/${addressId}`);
      console.log(`✅ GET /addresses/${addressId} success:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ GET /addresses/${addressId} error:`, error);
      throw error;
    }
  },
};
