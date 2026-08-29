import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

/**
 * Params mirror backend/utils/apiFeatures.js exactly:
 *   search, category, condition, minPrice, maxPrice, studentOnly,
 *   sort ("newest" | "price_asc" | "price_desc" | "popular"), page, limit
 *
 * `signal` (an AbortController signal) is optional and forwarded
 * straight to axios — used by useProducts.js to cancel a stale
 * in-flight request when filters change before it resolves.
 * Axios omits any param whose value is undefined/null, so callers can
 * pass a full filter object without pre-stripping empty fields.
 */
export const getProducts = (params, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.PRODUCTS.BASE, { params, signal });

export const getProductById = (id, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.PRODUCTS.BY_ID(id), { signal });

export const deleteProduct = (id) => axiosInstance.delete(ENDPOINTS.PRODUCTS.BY_ID(id));

// Public, fire-and-forget — Product Details calls this once per view.
// Deliberately no `signal`: an aborted view-count request (e.g. the
// user navigates away mid-request) shouldn't surface as an error
// anywhere, so it isn't wired into the same cancellation flow as the
// product fetch itself.
export const incrementViewCount = (id) => axiosInstance.patch(ENDPOINTS.PRODUCTS.VIEW(id));

export const getProductsBySeller = (sellerId, { signal } = {}) =>
  axiosInstance.get(ENDPOINTS.PRODUCTS.BY_SELLER(sellerId), { signal });

// Images are already uploaded straight to ImageKit by the time these
// are called (see uploadToImageKit.js) — this is now a plain JSON
// request with the resulting { url, fileId } pairs in `payload.images`,
// not multipart/form-data.
export const createProduct = (payload) => axiosInstance.post(ENDPOINTS.PRODUCTS.BASE, payload);

export const updateProduct = (id, payload) => axiosInstance.put(ENDPOINTS.PRODUCTS.BY_ID(id), payload);

// JSON, not multipart — separate from the main form save (see
// AvailabilityField.jsx). Only "active"/"sold"/"removed" are valid
// (backend/controllers/productController.js updateProductStatus).
export const updateProductStatus = (id, status) =>
  axiosInstance.patch(ENDPOINTS.PRODUCTS.STATUS(id), { status });
