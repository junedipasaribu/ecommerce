import axios from "axios";

const api = axios.create({
  baseURL: "/api", // adjust to your backend base URL when available
  timeout: 10000,
});

// Attach token if present in localStorage
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Simple response interceptor to normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // you can add centralized error handling here
    return Promise.reject(err);
  }
);

export default api;
