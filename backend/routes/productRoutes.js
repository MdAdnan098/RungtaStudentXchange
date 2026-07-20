import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  incrementViewCount,
  getProductsByCategory,
  getProductsBySeller,
} from "../controllers/productController.js";
import { protect, checkBanned } from "../middleware/authMiddleware.js";
import { uploadMultipleImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/category/:category", getProductsByCategory);
router.get("/seller/:sellerId", getProductsBySeller);

router.patch("/:id/status", protect, updateProductStatus);
router.patch("/:id/view", incrementViewCount);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, checkBanned, uploadMultipleImages, createProduct);
router.put("/:id", protect, checkBanned, uploadMultipleImages, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
