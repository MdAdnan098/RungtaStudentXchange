import express from "express";
import {
  getUserById,
  updateProfile,
  changePassword,
  updateAvatar,
  deleteAvatar,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getMyListings,
  deleteMyAccount,
} from "../controllers/userController.js";
import { protect, checkBanned } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me/wishlist", protect, getWishlist);
router.post("/me/wishlist/:productId", protect, checkBanned, addToWishlist);
router.delete("/me/wishlist/:productId", protect, removeFromWishlist);

router.get("/me/listings", protect, getMyListings);

router.put("/me/avatar", protect, checkBanned, updateAvatar);
router.delete("/me/avatar", protect, deleteAvatar);

router.put("/me/password", protect, checkBanned, changePassword);

router.put("/me", protect, checkBanned, updateProfile);
router.delete("/me", protect, deleteMyAccount);

router.get("/:id", getUserById);

export default router;
