import express from "express";
import { registerUser, loginUser, registerAdmin, loginAdmin, getMe } from "../controllers/authController.js";
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from "../controllers/passwordResetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { otpRequestLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.get("/me", protect, getMe);

// Forgot Password — public (the whole point is the user isn't logged in)
router.post("/forgot-password/send-otp", otpRequestLimiter, sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);

export default router;
