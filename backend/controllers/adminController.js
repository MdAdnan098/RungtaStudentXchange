import User from "../models/User.js";
import Product from "../models/Product.js";
import Report from "../models/Report.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Get live dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalListings, activeListings, pendingReports, verifiedStudents] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ status: "active" }),
        Report.countDocuments({ status: "pending" }),
        User.countDocuments({ isStudentVerified: true }),
      ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalUsers,
        totalListings,
        activeListings,
        pendingReports,
        verifiedStudents,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats",
      data: null,
    });
  }
};

// @desc    Get all users with search/filter/pagination
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, isBanned, isStudentVerified, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === "true";
    if (isStudentVerified !== undefined)
      filter.isStudentVerified = isStudentVerified === "true";

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: { users, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
      data: null,
    });
  }
};

// @desc    Get full details of a single user
// @route   GET /api/admin/users/:id
// @access  Private (admin only)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const listings = await Product.find({ seller: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: { user, listings },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user details",
      data: null,
    });
  }
};

// @desc    Update a user's editable profile fields
// @route   PATCH /api/admin/users/:id
// @access  Private (admin only)
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const { name, email, phone, location, bio, role } = req.body;

    if (email !== undefined && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: "That email is already in use by another account",
          data: null,
        });
      }
    }

    if (role !== undefined && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either user or admin",
        data: null,
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone || null;
    if (location !== undefined) user.location = location || null;
    if (bio !== undefined) user.bio = bio || null;
    if (role !== undefined) user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message, data: null });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
      data: null,
    });
  }
};

// @desc    Ban a user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (admin only)
export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be banned",
        data: null,
      });
    }

    user.isBanned = true;
    user.bannedReason = reason || "Violation of platform policies";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User banned successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to ban user",
      data: null,
    });
  }
};

// @desc    Unban a user
// @route   PATCH /api/admin/users/:id/unban
// @access  Private (admin only)
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.isBanned = false;
    user.bannedReason = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to unban user",
      data: null,
    });
  }
};

// @desc    Permanently delete a user from the database
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUserPermanently = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted",
        data: null,
      });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted permanently",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
      data: null,
    });
  }
};

// @desc    Permanently delete every user account except admins
//          (the currently logged-in admin's own account is never
//          touched, since admin accounts are always excluded — this
//          mirrors the same rule deleteUserPermanently already
//          enforces for single-user deletes)
// @route   DELETE /api/admin/users/bulk
// @access  Private (admin only)
export const deleteAllUsers = async (req, res) => {
  try {
    const usersToDelete = await User.find({ role: { $ne: "admin" } }).select("avatarPublicId");

    for (const user of usersToDelete) {
      if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
      }
    }

    const result = await User.deleteMany({ role: { $ne: "admin" } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} user(s) deleted permanently`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all users",
      data: null,
    });
  }
};

// @desc    Revoke a user's student verification
// @route   PATCH /api/admin/users/:id/revoke-student
// @access  Private (admin only)
export const revokeStudentVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.isStudentVerified = false;
    user.studentEmail = null;
    user.studentVerifiedAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Student verification revoked successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to revoke student verification",
      data: null,
    });
  }
};

// @desc    Get all listings across all statuses for moderation
// @route   GET /api/admin/products
// @access  Private (admin only)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("seller", "name email isBanned");

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { products, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
      data: null,
    });
  }
};

// @desc    Force-remove a listing regardless of owner
// @route   PATCH /api/admin/products/:id/remove
// @access  Private (admin only)
export const forceRemoveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    product.status = "removed";
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove product",
      data: null,
    });
  }
};

// @desc    Permanently delete a listing from the database
// @route   DELETE /api/admin/products/:id
// @access  Private (admin only)
export const deleteProductPermanently = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    for (const image of product.images) {
      await deleteFromCloudinary(image.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ product: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Listing deleted permanently",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete listing",
      data: null,
    });
  }
};

// @desc    Permanently delete every listing (and their Cloudinary
//          images and any reports filed against them — same cascade
//          cleanup deleteProductPermanently already does per-listing)
// @route   DELETE /api/admin/products/bulk
// @access  Private (admin only)
export const deleteAllProducts = async (req, res) => {
  try {
    const productsToDelete = await Product.find({}).select("images");

    for (const product of productsToDelete) {
      for (const image of product.images) {
        await deleteFromCloudinary(image.publicId);
      }
    }

    const result = await Product.deleteMany({});
    await Report.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} listing(s) deleted permanently`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all listings",
      data: null,
    });
  }
};

// @desc    Get all reports with optional status filter
// @route   GET /api/admin/reports
// @access  Private (admin only)
export const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Report.countDocuments(filter);

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("reporter", "name email")
      .populate("product", "title images status");

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: { reports, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reports",
      data: null,
    });
  }
};

// @desc    Get full details of a single report
// @route   GET /api/admin/reports/:id
// @access  Private (admin only)
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "name email")
      .populate("product")
      .populate("resolvedBy", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: { report },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch report",
      data: null,
    });
  }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
// @access  Private (admin only)
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: pending, reviewed, resolved, dismissed",
        data: null,
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        data: null,
      });
    }

    report.status = status;

    if (["resolved", "dismissed"].includes(status)) {
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: { report },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update report status",
      data: null,
    });
  }
};

// @desc    Permanently delete a report
// @route   DELETE /api/admin/reports/:id
// @access  Private (admin only)
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        data: null,
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Report deleted permanently",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete report",
      data: null,
    });
  }
};

// @desc    Permanently delete every report
// @route   DELETE /api/admin/reports/bulk
// @access  Private (admin only)
export const deleteAllReports = async (req, res) => {
  try {
    const result = await Report.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} report(s) deleted permanently`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all reports",
      data: null,
    });
  }
};
