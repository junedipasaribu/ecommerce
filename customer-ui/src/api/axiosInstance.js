import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Helper untuk cek auth routes
const isAuthRoute = (url) =>
  url.includes("/auth/login") || url.includes("/auth/register");

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (!isAuthRoute(config.url) && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Token invalid/expired → redirect login");
      // Opsional: localStorage.clear();
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
