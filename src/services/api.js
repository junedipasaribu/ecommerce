import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
  timeout: import.meta.env.VITE_API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
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
  (err) => Promise.reject(err)
);

export default api;
