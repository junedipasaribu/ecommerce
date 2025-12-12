import axiosInstance from "../api/axiosInstance";

export const productService = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/products", { params });
      return response.data || response || [];
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Error getting product ${id}:`, error);
      throw error;
    }
  },

  getUniqueCategories: async () => {
    try {
      const response = await axiosInstance.get("/products");
      const products = response.data || response || [];

      const uniqueCategories = [];
      const seenCategories = new Set();

      products.forEach((product) => {
        if (product.categoryName && !seenCategories.has(product.categoryName)) {
          seenCategories.add(product.categoryName);
          uniqueCategories.push({
            id: product.categoryName.toLowerCase().replace(/\s+/g, "-"),
            name: product.categoryName,
            originalCategoryId: product.categoryId,
          });
        }
      });

      return uniqueCategories;
    } catch (error) {
      console.error("Error getting unique categories:", error);

      return [];
    }
  },

  getByCategory: async (categoryName, params = {}) => {
    try {
      if (!categoryName || categoryName === "all") {
        return await productService.getAll(params);
      }

      const response = await axiosInstance.get("/products", {
        params: { ...params, categoryName },
      });
      return response.data || response || [];
    } catch (error) {
      console.error(
        `Error getting products for category ${categoryName}:`,
        error
      );
      throw error;
    }
  },

  addToCart: async (data) => {
    try {
      const response = await axiosInstance.post("cart", data);
      return response.data;
    } catch (error) {
      console.log("Failed to adding item:", error);
      throw error;
    }
  },
};
