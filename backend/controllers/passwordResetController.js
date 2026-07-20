import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { generateNumericOTP, hashOTP, compareOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { generatePasswordResetToken } from "../utils/generateToken.js";

const OTP_EXPIRY_MS = (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;
const PURPOSE = "passwordReset";

// Shared by both steps below — one wording so a wrong phone and a
// wrong email look identical to the caller (no hint about which part
// was wrong, and no confirmation that a given mobile number exists).
const MISMATCH_MESSAGE = "Mobile number aur email match nahi kar rahe. Ek baar details dobara check karo.";

const findMatchingUser = async (phone, email) => {
  const user = await User.findOne({ phone });
  if (!user || !user.email || user.email.toLowerCase() !== String(email).toLowerCase()) {
    return null;
  }
  return user;
};

// @desc    Verify mobile + recovery email match, then send a password-reset OTP
// @route   POST /api/auth/forgot-password/send-otp
// @access  Public
export const sendPasswordResetOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Mobile number aur email dono chahiye",
        data: null,
      });
    }

    const user = await findMatchingUser(phone, email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: MISMATCH_MESSAGE,
        data: null,
      });
    }

    const normalizedEmail = user.email.toLowerCase();

    await OTP.deleteMany({ email: normalizedEmail, purpose: PURPOSE });

    const otp = generateNumericOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OTP.create({
      email: normalizedEmail,
      otpHash,
      purpose: PURPOSE,
      expiresAt,
    });

    await sendOTPEmail(user.email, otp, PURPOSE);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: { email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
      data: null,
    });
  }
};

// @desc    Verify the password-reset OTP and issue a short-lived reset token
// @route   POST /api/auth/forgot-password/verify-otp
// @access  Public
export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    if (!phone || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number, email, aur OTP dono chahiye",
        data: null,
      });
    }

    const user = await findMatchingUser(phone, email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: MISMATCH_MESSAGE,
        data: null,
      });
    }

    const normalizedEmail = user.email.toLowerCase();

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      purpose: PURPOSE,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please request a new one",
        data: null,
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
        data: null,
      });
    }

    const isMatch = await compareOTP(otp, otpRecord.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "😕 OTP match nahi hua. Ek baar dobara check karke try karo.",
        data: null,
      });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const resetToken = generatePasswordResetToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: { resetToken },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
      data: null,
    });
  }
};

// @desc    Set a new password using the reset token from verifyPasswordResetOtp
// @route   POST /api/auth/forgot-password/reset
// @access  Public (gated by the short-lived reset token, not a login session)
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token aur naya password chahiye",
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
        data: null,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      // Intentionally 400, not 401 — this token isn't a login session,
      // and axiosInstance's response interceptor logs the user out on
      // any 401, which would be the wrong side effect here.
      return res.status(400).json({
        success: false,
        message: "Reset link expire ho gaya, dobara try karo",
        data: null,
      });
    }

    if (decoded.purpose !== "passwordReset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
        data: null,
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "🎉 Password successfully reset ho gaya! Ab naye password se login kar sakte ho.",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
      data: null,
    });
  }
};
