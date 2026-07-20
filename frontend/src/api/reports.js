import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// POST /reports (protect) — body shape mirrors reportController.js
// createReport exactly: { productId, reason, description }.
// `description` is optional server-side (defaults to null).
export const createReport = ({ productId, reason, description }) =>
  axiosInstance.post(ENDPOINTS.REPORTS.BASE, { productId, reason, description });
