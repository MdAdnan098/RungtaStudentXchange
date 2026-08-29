import Product from "../models/Product.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";
import { deleteFromImageKit } from "../config/imagekit.js";
import {
  applySearch,
  applyFilters,
  applySort,
  applyPagination,
} from "../utils/apiFeatures.js";

// @desc    Get all products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    let query = Product.find({ status: "active" });

    query = applySearch(query, req.query);
    query = applyFilters(query, req.query);
    query = applySort(query, req.query);

    const total = await Product.countDocuments(query.getFilter());

    query = applyPagination(query, req.query);

    const products = await query.populate("seller", "name avatar isStudentVerified");

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
      data: null,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name avatar isStudentVerified location"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
      data: null,
    });
  }
};

// @desc    Create new product listing
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      negotiable,
      location,
      tags,
      whatsappNumber,
      alternateNumber,
    } = req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price, category, and condition are required",
        data: null,
      });
    }

    if (!whatsappNumber || !/^[0-9]{10}$/.test(whatsappNumber)) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit WhatsApp number is required so buyers can contact you",
        data: null,
      });
    }

    if (alternateNumber && !/^[0-9]{10}$/.test(alternateNumber)) {
      return res.status(400).json({
        success: false,
        message: "Alternate number must be a valid 10-digit number",
        data: null,
      });
    }

    // Images are no longer uploaded here — the browser already
    // uploaded them straight to ImageKit and sends back the
    // resulting {url, fileId} pairs in the JSON body.
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
        data: null,
      });
    }

    if (images.length > 6) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 6 images is allowed",
        data: null,
      });
    }

    const uploadedImages = images.map((image) => ({ url: image.url, publicId: image.fileId }));
    
    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition,
      negotiable: negotiable || false,
      location,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      whatsappNumber,
      alternateNumber: alternateNumber || null,
      images: uploadedImages,
      seller: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
      data: null,
    });
  }
};

// @desc    Update own product listing
// @route   PUT /api/products/:id
// @access  Private (owner only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
        data: null,
      });
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      negotiable,
      location,
      tags,
      whatsappNumber,
      alternateNumber,
    } = req.body;

    if (whatsappNumber !== undefined && !/^[0-9]{10}$/.test(whatsappNumber)) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit WhatsApp number is required so buyers can contact you",
        data: null,
      });
    }

    if (alternateNumber && !/^[0-9]{10}$/.test(alternateNumber)) {
      return res.status(400).json({
        success: false,
        message: "Alternate number must be a valid 10-digit number",
        data: null,
      });
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;
    if (negotiable !== undefined) product.negotiable = negotiable;
    if (location !== undefined) product.location = location;
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim());
    }
    if (whatsappNumber !== undefined) product.whatsappNumber = whatsappNumber;
    if (alternateNumber !== undefined) product.alternateNumber = alternateNumber || null;

    const { images } = req.body;

    if (images && Array.isArray(images) && images.length > 0) {
      if (images.length > 6) {
        return res.status(400).json({
          success: false,
          message: "A maximum of 6 images is allowed",
          data: null,
        });
      }

      // Old ImageKit files are deleted only after the new ones are
      // already confirmed uploaded (the browser did that before
      // calling this endpoint) — so a failed upload never leaves a
      // listing with no images at all.
      // Only delete images that are actually being removed — an
      // image the user kept unchanged (same fileId still present in
      // the incoming array) must survive on ImageKit, not get wiped
      // just because the listing was re-saved.
      const incomingFileIds = new Set(images.map((image) => image.fileId).filter(Boolean));
      const imagesToDelete = product.images.filter((image) => !incomingFileIds.has(image.publicId));
      await Promise.all(imagesToDelete.map((image) => deleteFromImageKit(image.publicId)));

      product.images = images.map((image) => ({ url: image.url, publicId: image.fileId }));

      product.images = images.map((image) => ({ url: image.url, publicId: image.fileId }));
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
      data: null,
    });
  }
};

// @desc    Delete own product listing
// @route   DELETE /api/products/:id
// @access  Private (owner only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this listing",
        data: null,
      });
    }

    await Promise.all(product.images.map((image) => deleteFromImageKit(image.publicId)));

    await Product.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ product: req.params.id });
    await Notification.deleteMany({ product: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
      data: null,
    });
  }
};

// @desc    Update product status (active/sold/removed)
// @route   PATCH /api/products/:id/status
// @access  Private (owner only)
export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "sold", "removed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, sold, removed",
        data: null,
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const isOwnerStatus = product.seller.toString() === req.user._id.toString();
    const isAdminStatus = req.user.role === "admin";

    if (!isOwnerStatus && !isAdminStatus) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
        data: null,
      });
    }

    product.status = status;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product status",
      data: null,
    });
  }
};

// @desc    Increment product view count
// @route   PATCH /api/products/:id/view
// @access  Public
export const incrementViewCount = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Notify the seller — but never when they're viewing their own
    // listing (req.user is only set if the viewer is logged in,
    // thanks to optionalAuth; guests always pass this check).
    if (!req.user || String(req.user._id) !== String(product.seller)) {
      await Notification.create({
        recipient: product.seller,
        type: "product_view",
        product: product._id,
        message: `Someone viewed your listing "${product.title}"`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "View count updated",
      data: { viewCount: product.viewCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update view count",
      data: null,
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .populate("seller", "name avatar isStudentVerified");

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { products },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products by category",
      data: null,
    });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      status: "active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { products },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products by seller",
      data: null,
    });
  }
};
