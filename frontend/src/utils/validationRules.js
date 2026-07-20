// Mirrors backend/models/User.js (email regex, name maxlength),
// backend/controllers/authController.js (password min length), and
// backend/utils/generateOTP.js (6-digit numeric OTP) so a client-side
// rejection and a server-side rejection never disagree. If the
// backend's rules ever change, update here too.

export const emailRule = {
  required: "Email is required",
  pattern: {
    value: /^\S+@\S+\.\S+$/,
    message: "Enter a valid email address",
  },
};

export const phoneRule = {
  required: "Mobile number is required",
  pattern: {
    value: /^[6-9]\d{9}$/,
    message: "Enter a valid 10-digit mobile number",
  },
};

export const rungtaEmailRule = {
  required: "Apna Rungta email daalo",
  pattern: {
    value: /^[^\s@]+@rungta\.org$/i,
    message: "Sirf @rungta.org email allowed hai",
  },
};

export const nameRule = {
  required: "Name is required",
  maxLength: {
    value: 60,
    message: "Name cannot exceed 60 characters",
  },
};

export const usernameRule = {
  required: "Username is required",
  minLength: { value: 3, message: "Username must be at least 3 characters" },
  maxLength: { value: 30, message: "Username cannot exceed 30 characters" },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: "Username can only contain letters, numbers, and underscores",
  },
};

export const bioRule = {
  maxLength: {
    value: 200,
    message: "Bio cannot exceed 200 characters",
  },
};

export const passwordRule = {
  required: "Password is required",
  minLength: {
    value: 6,
    message: "Password must be at least 6 characters",
  },
};

export const confirmPasswordRule = (getPasswordValue) => ({
  required: "Please confirm your password",
  validate: (value) => value === getPasswordValue() || "Passwords do not match",
});

export const otpRule = {
  required: "Enter the verification code",
  pattern: { value: /^\d{6}$/, message: "Code must be 6 digits" },
};
