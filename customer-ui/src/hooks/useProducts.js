import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    ...initialParams,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getAll(params);

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data && Array.isArray(data.items)) {
        setProducts(data.items);
      } else {
        console.warn("Unexpected API response structure:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error in fetchProducts:", err);
      setError(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const reset = useCallback(() => {
    setParams({
      page: 1,
      limit: 12,
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refresh = () => {
    fetchProducts();
  };

  return {
    products: Array.isArray(products) ? products : [],
    loading,
    error,
    params,
    refresh,
    fetchProducts,
    updateParams,
    reset,

    isEmpty: !Array.isArray(products) || products.length === 0,
  };
};
