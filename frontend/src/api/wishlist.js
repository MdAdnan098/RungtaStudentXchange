import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// All three require auth (userRoutes.js: protect middleware) — the
// existing axios interceptor attaches the token automatically.
export const getWishlist = () => axiosInstance.get(ENDPOINTS.USERS.WISHLIST);

export const addToWishlist = (productId) =>
  axiosInstance.post(ENDPOINTS.USERS.WISHLIST_ITEM(productId));

export const removeFromWishlist = (productId) =>
  axiosInstance.delete(ENDPOINTS.USERS.WISHLIST_ITEM(productId));
