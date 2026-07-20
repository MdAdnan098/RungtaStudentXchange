import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// Mirrors backend/controllers/authController.js exactly — no fields
// added or renamed. Every call returns the full Axios response;
// callers read `.data.data` for the payload and `.data.message` for
// the backend's message.

export const registerUser = ({ name, phone, email, password }) =>
  axiosInstance.post(ENDPOINTS.AUTH.REGISTER, { name, phone, email, password });

export const loginUser = ({ phone, password }) =>
  axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { phone, password });

export const registerAdmin = ({ username, password, adminSecret }) =>
  axiosInstance.post(ENDPOINTS.AUTH.ADMIN_REGISTER, { username, password, adminSecret });

export const loginAdmin = ({ username, password }) =>
  axiosInstance.post(ENDPOINTS.AUTH.ADMIN_LOGIN, { username, password });

export const getMe = ({ signal } = {}) => axiosInstance.get(ENDPOINTS.AUTH.ME, { signal });
