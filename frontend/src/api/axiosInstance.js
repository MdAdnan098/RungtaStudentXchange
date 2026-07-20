import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// Backend mounts everything under /api (see server.js). Configure
// VITE_API_BASE_URL in .env — see .env.example.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (backend uses Bearer-token auth only, no refresh
// tokens — see middleware/authMiddleware.js and README.md) to every
// outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// The backend's access token is short-lived (JWT_ACCESS_EXPIRES_IN=15m,
// no refresh flow). A 401 here means "not authorized, token invalid or
// expired" (see authMiddleware.js) — log the user out so the UI doesn't
// sit in a broken authenticated state.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
