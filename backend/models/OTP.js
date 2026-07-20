import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },

  otpHash: {
    type: String,
    required: [true, "OTP hash is required"],
  },

  purpose: {
    type: String,
    required: [true, "Purpose is required"],
    enum: {
      values: ["studentVerify", "emailVerify", "passwordReset"],
      message: "Purpose must be studentVerify, emailVerify, or passwordReset",
    },
  },

  expiresAt: {
    type: Date,
    required: [true, "Expiry timestamp is required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// TTL index: MongoDB automatically deletes the document once expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.index({ email: 1, purpose: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
