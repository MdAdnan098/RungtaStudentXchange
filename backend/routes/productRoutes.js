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
import { protect, checkBanned, optionalAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/category/:category", getProductsByCategory);
router.get("/seller/:sellerId", getProductsBySeller);

router.patch("/:id/status", protect, updateProductStatus);
router.patch("/:id/view", optionalAuth, incrementViewCount);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, checkBanned, createProduct);
router.put("/:id", protect, checkBanned, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
