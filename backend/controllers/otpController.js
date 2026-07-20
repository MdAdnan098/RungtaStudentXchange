import OTP from "../models/OTP.js";
import User from "../models/User.js";
import { generateNumericOTP, hashOTP, compareOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

const OTP_EXPIRY_MS = (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;

// @desc    Send OTP for verification
// @route   POST /api/otp/send
// @access  Private
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email and purpose are required",
        data: null,
      });
    }

    if (!["studentVerify", "emailVerify"].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: "Purpose must be either studentVerify or emailVerify",
        data: null,
      });
    }

    // Only allow sending OTP to the user's own registered email
if (
  purpose === "emailVerify" &&
  email.toLowerCase() !== req.user.email.toLowerCase()
) {
  return res.status(400).json({
    success: false,
    message: "OTP can only be sent to your registered email address",
    data: null,
  });
}
if (purpose === "studentVerify") {
      if (!/^[^\s@]+@rungta\.org$/i.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please use your Rungta email (yourERP@rungta.org)",
          data: null,
        });
      }

      const existing = await User.findOne({
        studentEmail: email.toLowerCase(),
        isStudentVerified: true,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "This student email is already verified on another account",
          data: null,
        });
      }
    }

    await OTP.deleteMany({ email: email.toLowerCase(), purpose });

    const otp = generateNumericOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OTP.create({
      email: email.toLowerCase(),
      otpHash,
      purpose,
      expiresAt,
    });

    await sendOTPEmail(email, otp, purpose);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: { email, purpose },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
      data: null,
    });
  }
};

// @desc    Verify OTP and update verification status
// @route   POST /api/otp/verify
// @access  Private
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and purpose are required",
        data: null,
      });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose,
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
        message: "Invalid OTP",
        data: null,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // User can only verify their own registered email
if (
  purpose === "emailVerify" &&
  email.toLowerCase() !== user.email.toLowerCase()
) {
  return res.status(400).json({
    success: false,
    message: "You can only verify your registered email address",
    data: null,
  });
}
if (purpose === "emailVerify") {
      user.isEmailVerified = true;
    }

    if (purpose === "studentVerify") {
      user.isStudentVerified = true;
      user.studentEmail = email.toLowerCase();
      user.studentVerifiedAt = new Date();
    }

    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
      data: null,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Private
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email and purpose are required",
        data: null,
      });
    }

    if (!["studentVerify", "emailVerify"].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: "Purpose must be either studentVerify or emailVerify",
        data: null,
      });
    }

    if (purpose === "studentVerify" && !/^[^\s@]+@rungta\.org$/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please use your Rungta email (yourERP@rungta.org)",
        data: null,
      });
    }

    await OTP.deleteMany({ email: email.toLowerCase(), purpose });

    const otp = generateNumericOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OTP.create({
      email: email.toLowerCase(),
      otpHash,
      purpose,
      expiresAt,
    });

    await sendOTPEmail(email, otp, purpose);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: { email, purpose },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP",
      data: null,
    });
  }
};
