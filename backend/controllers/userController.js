import User from "../models/User.js";
import Product from "../models/Product.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Get public profile by user ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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

// @desc    Update own profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
      data: null,
    });
  }
};

// @desc    Change own password (requires current password)
// @route   PUT /api/users/me/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
        data: null,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
        data: null,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
        data: null,
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
      data: null,
    });
  }
};

// @desc    Update profile avatar
// @route   PUT /api/users/me/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
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

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, "avatars");

    user.avatar = result.url;
    user.avatarPublicId = result.publicId;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update avatar",
      data: null,
    });
  }
};

// @desc    Delete profile avatar
// @route   DELETE /api/users/me/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (!user.avatarPublicId) {
      return res.status(400).json({
        success: false,
        message: "No avatar to delete",
        data: null,
      });
    }

    await deleteFromCloudinary(user.avatarPublicId);

    user.avatar = null;
    user.avatarPublicId = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar removed successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete avatar",
      data: null,
    });
  }
};

// @desc    Get current user's wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: { wishlist: user.wishlist },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wishlist",
      data: null,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/me/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const user = await User.findById(req.user._id);

    const alreadyExists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
        data: null,
      });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: { wishlist: user.wishlist },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to wishlist",
      data: null,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/me/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some((id) => id.toString() === productId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
        data: null,
      });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: { wishlist: user.wishlist },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove product from wishlist",
      data: null,
    });
  }
};

// @desc    Get current user's own listings
// @route   GET /api/users/me/listings
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const listings = await Product.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: { listings },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch listings",
      data: null,
    });
  }
};

// @desc    Delete own account
// @route   DELETE /api/users/me
// @access  Private
export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete account",
      data: null,
    });
  }
};
