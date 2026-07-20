import express from "express";
import { sendOTP, verifyOTP, resendOTP } from "../controllers/otpController.js";
import { protect } from "../middleware/authMiddleware.js";
import { otpRequestLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send", protect, otpRequestLimiter, sendOTP);
router.post("/verify", protect, verifyOTP);
router.post("/resend", protect, otpRequestLimiter, resendOTP);

export default router;
