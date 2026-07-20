import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

// Short-lived token proving a user just completed OTP verification for
// a password reset — issued after verifyPasswordResetOtp, consumed by
// resetPassword. Carries `purpose` so it can never be mistaken for (or
// accepted in place of) a normal login access token.
export const generatePasswordResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: "passwordReset" }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || "10m",
  });
};
