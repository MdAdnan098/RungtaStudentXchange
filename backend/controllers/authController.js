import User from "../models/User.js";
import { generateAccessToken } from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number, email, and password are required",
        data: null,
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number",
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

    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this mobile number already exists",
        data: null,
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        data: null,
      });
    }

    const user = await User.create({ name, phone, email, password });

    const token = generateAccessToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user",
      data: null,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and password are required",
        data: null,
      });
    }

    const user = await User.findOne({ phone }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password",
        data: null,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
        data: null,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password",
        data: null,
      });
    }

    const token = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to login",
      data: null,
    });
  }
};

// @desc    Register a new admin account (username + password only)
// @route   POST /api/auth/admin/register
// @access  Public (gated by ADMIN_REGISTER_SECRET)
export const registerAdmin = async (req, res) => {
  try {
    const { username, password, adminSecret } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        data: null,
      });
    }

    if (process.env.ADMIN_REGISTER_SECRET && adminSecret !== process.env.ADMIN_REGISTER_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin registration key",
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

    const normalizedUsername = username.toLowerCase().trim();

    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken",
        data: null,
      });
    }

    const user = await User.create({
      name: normalizedUsername,
      username: normalizedUsername,
      password,
      role: "admin",
      isEmailVerified: true,
    });

    const token = generateAccessToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register admin",
      data: null,
    });
  }
};

// @desc    Login as admin (username + password only)
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        data: null,
      });
    }

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
      role: "admin",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        data: null,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
        data: null,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        data: null,
      });
    }

    const token = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to login",
      data: null,
    });
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user",
      data: null,
    });
  }
};
