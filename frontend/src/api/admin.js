import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// Mirrors backend/controllers/adminController.js exactly. Every admin
// route requires protect + requireAdmin server-side (adminRoutes.js);
// the frontend's AdminRoute guard mirrors that but is not a substitute
// for it — a non-admin hitting these directly still gets a real 403
// from the backend.

export const getDashboardStats = ({ signal } = {}) => axiosInstance.get(ENDPOINTS.ADMIN.STATS, { signal });

// getAllUsers filters: search (name/email regex), role, isBanned,
// isStudentVerified, page, limit (default 20).
export const getAllUsers = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.USERS, { params, signal });

export const getUserDetails = (id, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.USER_BY_ID(id), { signal });

// Editable fields: name, email, phone, location, bio, role. Any field
// left out of `updates` is left untouched server-side.
export const updateUserByAdmin = (id, updates) =>
  axiosInstance.patch(ENDPOINTS.ADMIN.USER_BY_ID(id), updates);

// `reason` is optional — banUser defaults to "Violation of platform
// policies" server-side if omitted.
export const banUser = (id, reason) => axiosInstance.patch(ENDPOINTS.ADMIN.BAN_USER(id), { reason });

export const unbanUser = (id) => axiosInstance.patch(ENDPOINTS.ADMIN.UNBAN_USER(id));

// Permanent — removes the user document (and their Cloudinary avatar,
// if any) from the database entirely. No undo.
export const deleteUser = (id) => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_USER(id));

// Permanent — removes every non-admin user (and their Cloudinary
// avatars). Admin accounts, including the caller's own, are always
// excluded server-side. No undo.
export const deleteAllUsers = () => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_ALL_USERS);

export const revokeStudentVerification = (id) => axiosInstance.patch(ENDPOINTS.ADMIN.REVOKE_STUDENT(id));

// getAllProductsAdmin filters: status, category, search (title/
// description regex), page, limit.
export const getAllProductsAdmin = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.PRODUCTS, { params, signal });

// One-way — sets status to "removed". No admin-side restore/undo
// endpoint exists (see backend limitations in the final summary).
export const forceRemoveProduct = (id) => axiosInstance.patch(ENDPOINTS.ADMIN.REMOVE_PRODUCT(id));

// Permanent — removes the product document (and its Cloudinary
// images) from the database entirely. No undo.
export const deleteProductPermanently = (id) => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_PRODUCT(id));

// Permanent — removes every listing (and their Cloudinary images),
// plus every report (since all reports reference a listing). No undo.
export const deleteAllProducts = () => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_ALL_PRODUCTS);

// getAllReports filters: status only, page, limit.
export const getAllReports = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.REPORTS, { params, signal });

export const getReportById = (id, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.REPORT_BY_ID(id), { signal });

// status must be one of: pending, reviewed, resolved, dismissed
// (backend/models/Report.js enum).
export const updateReportStatus = (id, status) => axiosInstance.patch(ENDPOINTS.ADMIN.REPORT_BY_ID(id), { status });

// Permanent — removes the report document from the database
// entirely. Does not touch the reported product or its seller. No
// undo.
export const deleteReport = (id) => axiosInstance.delete(ENDPOINTS.ADMIN.REPORT_BY_ID(id));

// Permanent — removes every report from the database entirely. Does
// not touch any listings or sellers. No undo.
export const deleteAllReports = () => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_ALL_REPORTS);

// ─── Visitor Analytics ────────────────────────────────────────────────────
// Mirrors backend/controllers/visitorController.js exactly.

export const getVisitorStats = ({ signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.VISITOR_STATS, { signal });

export const getVisitorMap = ({ signal } = {}) => axiosInstance.get(ENDPOINTS.ADMIN.VISITOR_MAP, { signal });

// getAllVisitors filters: search (city/state/country/browser regex),
// isGuest, permissionStatus, deviceType, startDate, endDate, page,
// limit (default 20).
export const getAllVisitors = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.VISITORS, { params, signal });

// Same filters as getAllVisitors but unpaginated (capped at 10,000
// server-side) — feeds the client-side CSV export.
export const exportVisitors = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.ADMIN.VISITORS_EXPORT, { params, signal });

// Permanent — removes the visitor log document from the database
// entirely. No undo.
export const deleteVisitor = (id) => axiosInstance.delete(ENDPOINTS.ADMIN.VISITOR_BY_ID(id));

// Permanent — removes every visitor log from the database entirely.
// No undo.
export const deleteAllVisitors = () => axiosInstance.delete(ENDPOINTS.ADMIN.DELETE_ALL_VISITORS);
