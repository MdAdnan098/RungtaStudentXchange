import Report from "../models/Report.js";
import Product from "../models/Product.js";

// @desc    Create a new report against a product
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { productId, reason, description } = req.body;

    if (!productId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product ID and reason are required",
        data: null,
      });
    }

    if (!["spam", "misleading", "prohibited", "duplicate", "other"].includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reason provided",
        data: null,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      product: productId,
      reason,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { report },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit report",
      data: null,
    });
  }
};

// @desc    Get reports submitted by current user
// @route   GET /api/reports/me
// @access  Private
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .populate("product", "title images status");

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: { reports },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reports",
      data: null,
    });
  }
};
