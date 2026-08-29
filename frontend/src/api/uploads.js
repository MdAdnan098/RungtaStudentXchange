import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// Fetches a short-lived signed token from our backend so the browser
// can upload directly to ImageKit — actual image bytes never pass
// through our Render server.
export const getUploadAuth = () => axiosInstance.get(ENDPOINTS.UPLOADS.AUTH);