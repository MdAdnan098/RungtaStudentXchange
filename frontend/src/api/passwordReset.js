import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// Mirrors backend/controllers/passwordResetController.js. All three
// routes are public (no Bearer token) — the whole point of this flow
// is that the user is logged out and can't get back in.

export const sendPasswordResetOtp = ({ phone, email }) =>
  axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_SEND_OTP, { phone, email });

export const verifyPasswordResetOtp = ({ phone, email, otp }) =>
  axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY_OTP, { phone, email, otp });

export const resetPassword = ({ resetToken, password }) =>
  axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, { resetToken, password });
