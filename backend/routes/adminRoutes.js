import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserByAdmin,
  banUser,
  unbanUser,
  deleteUserPermanently,
  deleteAllUsers,
  revokeStudentVerification,
  getAllProductsAdmin,
  forceRemoveProduct,
  deleteProductPermanently,
  deleteAllProducts,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  deleteAllReports,
} from "../controllers/adminController.js";
import {
  getVisitorStats,
  getAllVisitors,
  exportVisitors,
  getVisitorMap,
  deleteVisitor,
  deleteAllVisitors,
} from "../controllers/visitorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/stats", getDashboardStats);

router.get("/users", getAllUsers);
// Bulk route must be registered before "/users/:id" — otherwise
// Express would match "bulk" as an :id param on that route instead.
router.delete("/users/bulk", deleteAllUsers);
router.patch("/users/:id", updateUserByAdmin);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);
router.delete("/users/:id", deleteUserPermanently);
router.patch("/users/:id/revoke-student", revokeStudentVerification);
router.get("/users/:id", getUserDetails);

router.get("/products", getAllProductsAdmin);
// Same ordering reason as "/users/bulk" above.
router.delete("/products/bulk", deleteAllProducts);
router.patch("/products/:id/remove", forceRemoveProduct);
router.delete("/products/:id", deleteProductPermanently);

router.get("/reports", getAllReports);
// Same ordering reason as "/users/bulk" above.
router.delete("/reports/bulk", deleteAllReports);
router.patch("/reports/:id", updateReportStatus);
router.delete("/reports/:id", deleteReport);
router.get("/reports/:id", getReportById);

// Static/bulk visitor routes must be registered before "/visitors/:id"
// — same ordering reason as "/users/bulk" above.
router.get("/visitors/stats", getVisitorStats);
router.get("/visitors/map", getVisitorMap);
router.get("/visitors/export", exportVisitors);
router.get("/visitors", getAllVisitors);
router.delete("/visitors/bulk", deleteAllVisitors);
router.delete("/visitors/:id", deleteVisitor);

export default router;
