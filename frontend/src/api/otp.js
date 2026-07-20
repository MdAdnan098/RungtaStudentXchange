import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// otpRoutes.js guards all three routes with `protect` — the caller
// must already be logged in (axiosInstance's request interceptor
// attaches the token automatically). `purpose` defaults to
// "studentVerify" since that's this app's only live OTP flow — the
// Student Verification card in the dashboard. The backend's other
// purpose, "emailVerify", is no longer triggered anywhere in the UI
// (registration creates the account directly, without OTP).

export const sendOtp = ({ email, purpose = "studentVerify" }) =>
  axiosInstance.post(ENDPOINTS.OTP.SEND, { email, purpose });

export const verifyOtp = ({ email, otp, purpose = "studentVerify" }) =>
  axiosInstance.post(ENDPOINTS.OTP.VERIFY, { email, otp, purpose });

export const resendOtp = ({ email, purpose = "studentVerify" }) =>
  axiosInstance.post(ENDPOINTS.OTP.RESEND, { email, purpose });
