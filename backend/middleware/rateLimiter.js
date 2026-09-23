import rateLimit from "express-rate-limit";

export const generalApiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    data: null,
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    data: null,
  },
});

export const otpRequestLimiter = rateLimit({
  windowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
  max: Number(process.env.OTP_RATE_LIMIT_MAX_REQUESTS) || 5,
  keyGenerator: (req) => req.user?._id?.toString() || req.body?.email || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests, please try again later",
    data: null,
  },
});
